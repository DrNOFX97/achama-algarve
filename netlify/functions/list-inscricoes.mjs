import { verifySession } from './lib/session.mjs';
import { findFormIdByName, listSubmissions } from './lib/netlify-api.mjs';

// "Aprovado" fica de fora por agora: nenhuma das duas forms guarda quem/quando
// aprovou, e decidimos não inventar esse mecanismo nesta tarefa.
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
        };
    });

    lista.sort((a, b) => new Date(b.data) - new Date(a.data));

    return Response.json({ inscricoes: lista }, { status: 200 });
};
