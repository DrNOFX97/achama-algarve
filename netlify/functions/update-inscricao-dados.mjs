import { verifySession } from './lib/session.mjs';
import { getInscricoesStore } from './lib/blobs.mjs';

// Netlify Forms não permite editar o conteúdo de uma submissão — por isso as
// correções feitas no painel admin ("Ver detalhes/Editar") são guardadas
// como override em Blobs, na mesma store e sob o mesmo id do estado
// (Aprovado/Apagado, ver update-inscricao-estado.mjs), e fundidas por cima
// dos dados originais em list-inscricoes.mjs. A submissão real nunca é
// tocada.
const EDITABLE_FIELDS = new Set([
    'nome', 'email', 'telefone', 'nif', 'cc_bi', 'data_nascimento',
    'morada', 'codigo_postal', 'localidade', 'concelho', 'distrito',
    'profissao', 'meio_comunicacao', 'categoria',
]);

export default async (req) => {
    const sessionSecret = process.env.SESSION_SECRET;
    const session = sessionSecret ? verifySession(req.headers.get('cookie'), sessionSecret) : null;
    if (!session) {
        return Response.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'Pedido inválido — esperado JSON.' }, { status: 400 });
    }

    const { id, dados } = body;
    if (!id || typeof id !== 'string') {
        return Response.json({ error: 'id em falta.' }, { status: 400 });
    }
    if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
        return Response.json({ error: 'dados em falta.' }, { status: 400 });
    }

    const dadosLimpos = {};
    for (const [key, value] of Object.entries(dados)) {
        if (!EDITABLE_FIELDS.has(key) || typeof value !== 'string') continue;
        const trimmed = value.trim();
        if (trimmed) dadosLimpos[key] = trimmed;
    }
    if (Object.keys(dadosLimpos).length === 0) {
        return Response.json({ error: 'Nenhum campo válido para guardar.' }, { status: 400 });
    }

    try {
        const store = getInscricoesStore();
        const existing = (await store.get(id, { type: 'json' })) || {};
        await store.setJSON(id, {
            ...existing,
            dados: { ...(existing.dados || {}), ...dadosLimpos },
            updatedAt: new Date().toISOString(),
            updatedBy: session.email,
        });
    } catch {
        return Response.json({ error: 'Falha ao guardar as alterações.' }, { status: 502 });
    }

    return Response.json({ ok: true }, { status: 200 });
};
