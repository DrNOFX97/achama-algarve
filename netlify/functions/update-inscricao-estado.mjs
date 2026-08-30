import { verifySession } from './lib/session.mjs';
import { getInscricoesStore } from './lib/blobs.mjs';

// Overrides suportados: marcar "Aprovado" ou "Apagado" (soft-delete — ver
// delete-inscricao.mjs), e reverter qualquer um dos dois passando `null`. Os
// restantes campos da inscrição nunca são editáveis por aqui — vêm sempre
// do Netlify Forms.
const ALLOWED_ESTADOS = new Set(['Aprovado', 'Apagado', null]);

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

    const { id, estado } = body;
    if (!id || typeof id !== 'string') {
        return Response.json({ error: 'id em falta.' }, { status: 400 });
    }
    if (!ALLOWED_ESTADOS.has(estado ?? null)) {
        return Response.json({ error: 'estado inválido.' }, { status: 400 });
    }

    try {
        const store = getInscricoesStore();
        if (estado === 'Aprovado' || estado === 'Apagado') {
            await store.setJSON(id, { estado, updatedAt: new Date().toISOString(), updatedBy: session.email });
        } else {
            await store.delete(id);
        }
    } catch {
        return Response.json({ error: 'Falha ao guardar o estado.' }, { status: 502 });
    }

    return Response.json({ ok: true }, { status: 200 });
};
