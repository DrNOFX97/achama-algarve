import crypto from 'node:crypto';

const OAUTH_STATE_COOKIE = 'acimha_oauth_state';

export default async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return new Response('Configuração de autenticação em falta no servidor (GOOGLE_CLIENT_ID / GOOGLE_REDIRECT_URI).', { status: 500 });
    }

    const state = crypto.randomBytes(16).toString('base64url');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', 'openid email');
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('prompt', 'select_account');

    const headers = new Headers();
    headers.set('Location', authUrl.toString());
    headers.append('Set-Cookie', `${OAUTH_STATE_COOKIE}=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=300`);

    return new Response(null, { status: 302, headers });
};
