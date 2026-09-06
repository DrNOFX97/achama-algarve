import { verifySession } from './lib/session.mjs';
import { findFormIdByName, listSubmissions } from './lib/netlify-api.mjs';
import { getInscricoesStore } from './lib/blobs.mjs';

// "Aprovado" não vem de nenhuma das duas forms — é aplicado mais abaixo a
// partir do override guardado em Blobs (update-inscricao-estado.mjs).
const CATEGORIA_LABELS = {
    civico: 'Sócio Cívico',
    habitacional: 'Sócio Habitacional',
};

export default async (req) => {
    const sessionSecret = process.env.SESSION_SECRET;
    const session = sessionSecret ? verifySession(req.headers.get('cookie'), sessionSecret) : null;
    if (!session) {
        return Response.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
    const siteId = process.env.NETLIFY_SITE_ID;
    if (!netlifyToken || !siteId) {
        return Response.json(
            { error: 'Configuração em falta no servidor (NETLIFY_AUTH_TOKEN / NETLIFY_SITE_ID).' },
            { status: 500 }
        );
    }

    let inscricaoFormId;
    let assinaturaFormId;
    try {
        [inscricaoFormId, assinaturaFormId] = await Promise.all([
            findFormIdByName(siteId, 'inscricao', netlifyToken),
            findFormIdByName(siteId, 'inscricao-assinatura', netlifyToken),
        ]);
    } catch {
        return Response.json({ error: 'Falha ao contactar a API do Netlify.' }, { status: 502 });
    }

    if (!inscricaoFormId) {
        return Response.json({ error: 'Formulário "inscricao" não encontrado no site.' }, { status: 500 });
    }

    let inscricoes;
    let assinaturas;
    try {
        inscricoes = await listSubmissions(inscricaoFormId, netlifyToken);
        assinaturas = assinaturaFormId ? await listSubmissions(assinaturaFormId, netlifyToken) : [];
    } catch {
        return Response.json({ error: 'Falha ao listar submissões do Netlify Forms.' }, { status: 502 });
    }

    // Por email, guarda a submissão de assinatura mais recente.
    const assinaturaPorEmail = new Map();
    for (const sub of assinaturas) {
        const email = sub.data?.email;
        if (!email) continue;
        const existing = assinaturaPorEmail.get(email);
        if (!existing || new Date(sub.created_at) > new Date(existing.created_at)) {
            assinaturaPorEmail.set(email, sub);
        }
    }

    const lista = inscricoes.map((sub) => {
        const email = sub.data?.email || null;
        const assinatura = email ? assinaturaPorEmail.get(email) : null;
        const temAssinatura = Boolean(assinatura?.data?.ficha_assinada?.url);
        const categoria = sub.data?.tipo_associado || null;

        return {
            id: sub.id,
            nome: sub.data?.nome || null,
            email,
            categoria,
            categoriaLabel: CATEGORIA_LABELS[categoria] || categoria,
            data: sub.created_at,
            estado: temAssinatura ? 'Pendente aprovação' : 'Pendente assinatura CMD',
            pdfUrl: temAssinatura
                ? `/.netlify/functions/get-inscricao-pdf?submissionId=${assinatura.id}`
                : null,
            // Campos completos — só usados pelo modal "Ver detalhes/Editar" do
            // painel admin; a tabela principal só mostra os de cima.
            telefone: sub.data?.telefone || null,
            nif: sub.data?.nif || null,
            cc_bi: sub.data?.cc_bi || null,
            data_nascimento: sub.data?.data_nascimento || null,
            morada: sub.data?.morada || null,
            codigo_postal: sub.data?.codigo_postal || null,
            localidade: sub.data?.localidade || null,
            concelho: sub.data?.concelho || null,
            distrito: sub.data?.distrito || null,
            profissao: sub.data?.profissao || null,
            meio_comunicacao: sub.data?.meio_comunicacao || null,
            // Só usados para reconstruir o .docx ao reenviar por email
            // (admin.js, botão "Enviar documento para assinar").
            aceita_estatutos: Boolean(sub.data?.aceita_estatutos),
            autoriza_dados: Boolean(sub.data?.autoriza_dados),
            local: sub.data?.local || null,
            data_inscricao: sub.data?.data_inscricao || null,
        };
    });

    // Override de estado ("Aprovado" ou "Apagado", soft-delete) guardado em
    // Blobs — o Netlify Forms não tem forma de editar o conteúdo de uma
    // submissão nem de a apagar de forma reversível. Ao contrário do
    // "Aprovado", uma falha aqui não pode ser ignorada em silêncio: sem os
    // overrides, uma inscrição "Apagada" perde essa marca e reaparece na
    // lista ativa — por isso esta falha devolve erro em vez de continuar.
    try {
        const store = getInscricoesStore();
        const overrides = await Promise.all(
            lista.map((item) => store.get(item.id, { type: 'json' }))
        );
        overrides.forEach((override, i) => {
            if (override?.estado === 'Aprovado' || override?.estado === 'Apagado') {
                lista[i].estado = override.estado;
            }
            // Correções manuais gravadas pelo painel admin (update-inscricao-dados.mjs)
            // — a submissão do Netlify Forms em si nunca é alterada.
            if (override?.dados && typeof override.dados === 'object') {
                Object.assign(lista[i], override.dados);
                if (override.dados.categoria) {
                    lista[i].categoriaLabel = CATEGORIA_LABELS[override.dados.categoria] || override.dados.categoria;
                }
            }
        });
    } catch {
        return Response.json({ error: 'Falha ao carregar os estados das inscrições.' }, { status: 502 });
    }

    // Por omissão esconde as "Apagadas" (soft-delete) da lista principal.
    // ?apagados=1 devolve só essas, para o painel oferecer "Restaurar".
    const incluirApagados = new URL(req.url).searchParams.get('apagados') === '1';
    const filtrada = lista.filter((item) => (item.estado === 'Apagado') === incluirApagados);

    filtrada.sort((a, b) => new Date(b.data) - new Date(a.data));

    return Response.json({ inscricoes: filtrada }, { status: 200 });
};
