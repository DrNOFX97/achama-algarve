import { clearSessionCookie } from './lib/session.mjs';

export default async () => {
    const headers = new Headers();
    headers.append('Set-Cookie', clearSessionCookie());
    headers.set('Location', '/admin/');
    return new Response(null, { status: 302, headers });
};
