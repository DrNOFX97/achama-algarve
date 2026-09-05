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
    // Exige o campo `estado` explicitamente presente — sem isto, um pedido
    // mal formado com só {id} tinha `estado` como undefined, que a
    // comparação `?? null` tratava como um pedido de reversão válido.
    if (!('estado' in body) || !ALLOWED_ESTADOS.has(estado)) {
        return Response.json({ error: 'estado inválido.' }, { status: 400 });
    }

    try {
        const store = getInscricoesStore();
        // Preserva `dados` (correções manuais do painel admin) ao mudar o
        // estado — sobrescrever ou apagar o registo inteiro perderia essas
        // edições.
        const existing = (await store.get(id, { type: 'json' })) || {};
        if (estado === 'Aprovado' || estado === 'Apagado') {
            await store.setJSON(id, { ...existing, estado, updatedAt: new Date().toISOString(), updatedBy: session.email });
        } else if (existing.dados) {
            const { estado: _drop, ...rest } = existing;
            await store.setJSON(id, { ...rest, updatedAt: new Date().toISOString(), updatedBy: session.email });
        } else {
            await store.delete(id);
        }
    } catch {
        return Response.json({ error: 'Falha ao guardar o estado.' }, { status: 502 });
    }

    return Response.json({ ok: true }, { status: 200 });
};
