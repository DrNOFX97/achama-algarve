import { verifySession } from './lib/session.mjs';
import { findFormIdByName, listSubmissions, deleteSubmission } from './lib/netlify-api.mjs';
import { getInscricoesStore } from './lib/blobs.mjs';

// Apaga definitivamente (sem undo) a submissão "inscricao" e, se existir, a
// "inscricao-assinatura" correspondente pelo email. Reversível/soft-delete
// fica para quando isto for para uso real com associados — por agora é
// definitivo de propósito, para testar o fluxo.
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

    let body;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'Pedido inválido — esperado JSON.' }, { status: 400 });
    }

    const { id, email } = body;
    if (!id || typeof id !== 'string') {
        return Response.json({ error: 'id em falta.' }, { status: 400 });
    }

    try {
        await deleteSubmission(id, netlifyToken);
    } catch {
        return Response.json({ error: 'Falha ao apagar a inscrição no Netlify Forms.' }, { status: 502 });
    }

    if (email) {
        try {
            const assinaturaFormId = await findFormIdByName(siteId, 'inscricao-assinatura', netlifyToken);
            if (assinaturaFormId) {
                const assinaturas = await listSubmissions(assinaturaFormId, netlifyToken);
                const match = assinaturas.find((sub) => sub.data?.email === email);
                if (match) await deleteSubmission(match.id, netlifyToken);
            }
        } catch {
            // Best-effort — a inscrição principal já foi apagada; uma assinatura
            // órfã pode ser limpa manualmente mais tarde.
        }
    }

    try {
        await getInscricoesStore().delete(id);
    } catch {
        // Limpeza do override — não crítico se falhar.
    }

    return Response.json({ ok: true }, { status: 200 });
};
