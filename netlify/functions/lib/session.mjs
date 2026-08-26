import crypto from 'node:crypto';

export const SESSION_COOKIE_NAME = 'acimha_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60; // 8h

function sign(encodedPayload, secret) {
    return crypto.createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

export function parseCookies(cookieHeader) {
    const out = {};
    if (!cookieHeader) return out;
    cookieHeader.split(';').forEach((pair) => {
        const idx = pair.indexOf('=');
        if (idx === -1) return;
        out[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
    });
    return out;
}

export function createSessionCookie(email, secret) {
    const now = Math.floor(Date.now() / 1000);
    const payload = JSON.stringify({ email, iat: now, exp: now + SESSION_TTL_SECONDS });
    const encodedPayload = Buffer.from(payload, 'utf8').toString('base64url');
    const signature = sign(encodedPayload, secret);
    const token = `${encodedPayload}.${signature}`;
    return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
    return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

// Retorna { email } se o cookie de sessão for válido e não tiver expirado, ou null caso contrário.
export function verifySession(cookieHeader, secret) {
    const token = parseCookies(cookieHeader)[SESSION_COOKIE_NAME];
    if (!token) return null;

    const [encodedPayload, signature] = token.split('.');
    if (!encodedPayload || !signature) return null;

    const expectedSignature = sign(encodedPayload, secret);
    const provided = Buffer.from(signature);
    const expected = Buffer.from(expectedSignature);
    if (provided.length !== expected.length || !crypto.timingSafeEqual(provided, expected)) {
        return null;
    }

    let payload;
    try {
        payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    } catch {
        return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== 'number' || payload.exp < now) return null;
    if (typeof payload.email !== 'string' || !payload.email) return null;

    return { email: payload.email };
}
