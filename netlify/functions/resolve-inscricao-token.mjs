import { getInscricaoTokensStore } from './lib/blobs.mjs';

// Pública, sem gate de sessão admin — chamada pela página standalone
// assinatura.html para validar o token da URL antes de mostrar o formulário
// de upload da assinatura. Devolve só o email da inscrição (nunca outros
// dados pessoais) para pré-preencher o campo oculto do formulário de
// assinatura já existente.
//
// Token em falta, inexistente ou expirado devolvem sempre a mesma resposta
// genérica — nunca confirma nem nega se um token alguma vez existiu.
const GENERIC_ERROR = 'Link inválido ou expirado.';

export default async (req) => {
    const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
    const siteId = process.env.NETLIFY_SITE_ID;
    if (!netlifyToken || !siteId) {
        return Response.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
    }

    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) {
        return Response.json({ ok: false, error: GENERIC_ERROR }, { status: 400 });
    }

    try {
        const store = getInscricaoTokensStore();
        const record = await store.get(token, { type: 'json' });
        if (!record || new Date(record.expiresAt).getTime() < Date.now()) {
            return Response.json({ ok: false, error: GENERIC_ERROR }, { status: 400 });
        }
        return Response.json({ ok: true, email: record.email }, { status: 200 });
    } catch {
        return Response.json({ ok: false, error: GENERIC_ERROR }, { status: 500 });
    }
};
