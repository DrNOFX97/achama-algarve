import { verifySession } from './lib/session.mjs';
import { findFormIdByName, listSubmissions } from './lib/netlify-api.mjs';
import { getQueixasStore } from './lib/blobs.mjs';

const TIPO_LABELS = {
    degradacao: 'Degradação de edifício ou via pública',
    salubridade: 'Salubridade ou saneamento',
    seguranca: 'Segurança',
    acessibilidade: 'Acessibilidade',
    ruido: 'Ruído ou incómodo',
    outro: 'Outro',
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

    let formId;
    try {
        formId = await findFormIdByName(siteId, 'queixa-bairro', netlifyToken);
    } catch {
        return Response.json({ error: 'Falha ao contactar a API do Netlify.' }, { status: 502 });
    }

    if (!formId) {
        return Response.json({ queixas: [] }, { status: 200 });
    }

    let submissions;
    try {
        submissions = await listSubmissions(formId, netlifyToken);
    } catch {
        return Response.json({ error: 'Falha ao listar submissões do Netlify Forms.' }, { status: 502 });
    }

    const lista = submissions.map((sub) => {
        const tipo = sub.data?.tipo_problema || null;
        const temFoto = Boolean(sub.data?.foto?.url);
        return {
            id: sub.id,
            nome: sub.data?.nome || null,
            email: sub.data?.email || null,
            telefone: sub.data?.telefone || null,
            concelho: sub.data?.concelho || null,
            local: sub.data?.local || null,
            tipo,
            tipoLabel: TIPO_LABELS[tipo] || tipo,
            descricao: sub.data?.descricao || null,
            data: sub.created_at,
            estado: 'Pendente',
            fotoUrl: temFoto ? `/.netlify/functions/get-queixa-foto?submissionId=${sub.id}` : null,
        };
    });

    // Override de estado (Encaminhada/Resolvida/Apagado) guardado em Blobs —
    // mesma razão e mesmo cuidado que list-inscricoes.mjs: uma falha aqui não
    // pode ser ignorada em silêncio, porque uma queixa "Apagada" perderia
    // essa marca e reapareceria na lista ativa.
    try {
        const store = getQueixasStore();
        const overrides = await Promise.all(
            lista.map((item) => store.get(item.id, { type: 'json' }))
        );
        overrides.forEach((override, i) => {
            if (override?.estado) {
                lista[i].estado = override.estado;
            }
        });
    } catch {
        return Response.json({ error: 'Falha ao carregar os estados das queixas.' }, { status: 502 });
    }

    // Por omissão esconde as "Apagadas" (soft-delete) da lista principal.
    // ?apagados=1 devolve só essas, para o painel oferecer "Restaurar".
    const incluirApagadas = new URL(req.url).searchParams.get('apagados') === '1';
    const filtrada = lista.filter((item) => (item.estado === 'Apagado') === incluirApagadas);

    filtrada.sort((a, b) => new Date(b.data) - new Date(a.data));

    return Response.json({ queixas: filtrada }, { status: 200 });
};
