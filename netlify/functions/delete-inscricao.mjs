import { verifySession } from './lib/session.mjs';
import { getInscricoesStore } from './lib/blobs.mjs';

// Soft-delete: marca a inscrição como "Apagado" via override em Netlify
// Blobs (mesmo mecanismo do "Aprovado" em update-inscricao-estado.mjs), sem
// tocar na submissão real do Netlify Forms nem na assinatura associada.
// list-inscricoes.mjs esconde estas inscrições da lista por omissão;
// reverter (restaurar) é o mesmo pedido a update-inscricao-estado com
// estado: null. Antes desta função apagava a sério e sem undo — passou a
// reversível por não ser seguro usar apagar definitivo com associados reais.
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
        await getInscricoesStore().setJSON(id, {
            estado: 'Apagado',
            updatedAt: new Date().toISOString(),
            updatedBy: session.email,
        });
    } catch {
        return Response.json({ error: 'Falha ao guardar o estado.' }, { status: 502 });
    }

    return Response.json({ ok: true }, { status: 200 });
};
