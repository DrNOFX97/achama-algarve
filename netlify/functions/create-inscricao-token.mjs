import crypto from 'node:crypto';
import { getInscricaoTokensStore } from './lib/blobs.mjs';
import { getSubmission } from './lib/netlify-api.mjs';
import { verifySession } from './lib/session.mjs';

// Duas formas de chamar, com gates diferentes:
// 1. Pelo fluxo de inscrição (inscricao-modal.js), pública, com email/nome —
//    é o próprio autor da inscrição, logo a seguir a submetê-la.
// 2. Pelo painel admin (admin.js), com submissionId — exige sessão de admin,
//    porque um submissionId não é segredo (aparece em URLs de PDF) e sem
//    este gate qualquer pessoa podia gerar um token de assinatura para a
//    inscrição de outra pessoa.
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

    let email, nome;

    // Caso 1: chamada do fluxo de inscrição com email/nome
    if (body.email && body.nome) {
        email = typeof body.email === 'string' ? body.email.trim() : '';
        nome = typeof body.nome === 'string' ? body.nome.trim() : '';
        if (!email) {
            return Response.json({ error: 'email em falta.' }, { status: 400 });
        }
    }
    // Caso 2: chamada do admin com submissionId — exige sessão válida
    else if (body.submissionId) {
        const sessionSecret = process.env.SESSION_SECRET;
        const session = sessionSecret ? verifySession(req.headers.get('cookie'), sessionSecret) : null;
        if (!session) {
            return Response.json({ error: 'Não autenticado.' }, { status: 401 });
        }
        try {
            const submission = await getSubmission(body.submissionId, netlifyToken);
            email = submission.data?.email || '';
            nome = submission.data?.nome || '';
            if (!email) {
                return Response.json({ error: 'Email não encontrado na inscrição.' }, { status: 400 });
            }
        } catch {
            return Response.json({ error: 'Inscrição não encontrada.' }, { status: 404 });
        }
    } else {
        return Response.json({ error: 'email/nome ou submissionId em falta.' }, { status: 400 });
    }

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
