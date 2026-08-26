import { createSessionCookie, parseCookies } from './lib/session.mjs';

const OAUTH_STATE_COOKIE = 'acimha_oauth_state';
const CLEAR_STATE_COOKIE = `${OAUTH_STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;

function rejection(message, status) {
    return new Response(message, { status, headers: { 'Set-Cookie': CLEAR_STATE_COOKIE } });
}

export default async (req) => {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const oauthError = url.searchParams.get('error');

    if (oauthError) {
        return rejection(`Autenticação cancelada ou recusada pela Google (${oauthError}).`, 401);
    }

    const expectedState = parseCookies(req.headers.get('cookie'))[OAUTH_STATE_COOKIE];
    if (!code || !state || !expectedState || state !== expectedState) {
        return rejection('Pedido de autenticação inválido ou expirado. Tente novamente a partir de /admin/.', 400);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;
    const allowedEmail = process.env.ALLOWED_ADMIN_EMAIL;
    const sessionSecret = process.env.SESSION_SECRET;

    if (!clientId || !clientSecret || !redirectUri || !allowedEmail || !sessionSecret) {
        return new Response('Configuração de autenticação em falta no servidor.', { status: 500 });
    }

    let tokenRes;
    try {
        tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });
    } catch {
        return rejection('Falha ao contactar o servidor da Google.', 502);
    }

    if (!tokenRes.ok) {
        return rejection('Falha ao trocar o código de autorização com a Google.', 401);
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
        return rejection('Resposta inesperada da Google ao trocar o código de autorização.', 502);
    }

    let userInfoRes;
    try {
        userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
    } catch {
        return rejection('Falha ao obter os dados da conta Google.', 502);
    }

    if (!userInfoRes.ok) {
        return rejection('Falha ao obter os dados da conta Google.', 502);
    }

    const userInfo = await userInfoRes.json();

    if (!userInfo.email || userInfo.email_verified === false || userInfo.email !== allowedEmail) {
        return rejection('Esta conta Google não tem autorização para aceder ao painel de administração.', 403);
    }

    const headers = new Headers();
    headers.append('Set-Cookie', CLEAR_STATE_COOKIE);
    headers.append('Set-Cookie', createSessionCookie(userInfo.email, sessionSecret));
    headers.set('Location', '/admin/');

    return new Response(null, { status: 302, headers });
};
