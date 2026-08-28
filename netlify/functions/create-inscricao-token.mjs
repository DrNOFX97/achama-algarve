import crypto from 'node:crypto';
import { getInscricaoTokensStore } from './lib/blobs.mjs';

// Pública, sem gate de sessão — chamada pelo próprio fluxo de inscrição
// (inscricao-modal.js) logo a seguir à submissão, para gerar o link de
// retomar a assinatura. Por agora o link é mostrado no próprio ecrã (ver
// Tarefa 2 revista); quando o envio por email for ligado, vai sempre no
// corpo desse email.
const TOKEN_TTL_DIAS = 30;

export default async (req) => {
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

    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!email) {
        return Response.json({ error: 'email em falta.' }, { status: 400 });
    }
    const nome = typeof body.nome === 'string' ? body.nome.trim() : '';

    const token = crypto.randomUUID();
    const now = Date.now();
    const expiresAt = now + TOKEN_TTL_DIAS * 24 * 60 * 60 * 1000;

    try {
        const store = getInscricaoTokensStore();
        await store.setJSON(token, {
            email,
            nome,
            createdAt: new Date(now).toISOString(),
            expiresAt: new Date(expiresAt).toISOString(),
        });
    } catch {
        return Response.json({ error: 'Falha ao gerar o token de retomar.' }, { status: 502 });
    }

    return Response.json({ ok: true, token }, { status: 200 });
};
