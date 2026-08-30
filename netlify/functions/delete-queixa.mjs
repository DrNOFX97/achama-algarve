import { verifySession } from './lib/session.mjs';
import { getQueixasStore } from './lib/blobs.mjs';

// Soft-delete desde o início (ao contrário de delete-inscricao.mjs, que
// começou definitivo e só passou a reversível depois de uma auditoria):
// marca "Apagado" via override em Netlify Blobs, sem tocar na submissão
// real do Netlify Forms. list-queixas.mjs esconde estas da lista por
// omissão; restaurar é o mesmo pedido a update-queixa-estado com
// estado: null.
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

    const { id } = body;
    if (!id || typeof id !== 'string') {
        return Response.json({ error: 'id em falta.' }, { status: 400 });
    }

    try {
        await getQueixasStore().setJSON(id, {
            estado: 'Apagado',
            updatedAt: new Date().toISOString(),
            updatedBy: session.email,
        });
    } catch {
        return Response.json({ error: 'Falha ao guardar o estado.' }, { status: 502 });
    }

    return Response.json({ ok: true }, { status: 200 });
};
