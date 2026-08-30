import { getStore } from '@netlify/blobs';

// Throttling básico por IP, com janela fixa guardada em Netlify Blobs — não é
// exato sob concorrência alta, mas chega para impedir varrimento em massa
// (ex.: testar NIFs em sequência) a partir de um único cliente. Sem TTL
// nativo nos Blobs: a janela expira por comparação de timestamp na própria
// leitura, sem precisar de um job de limpeza.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 8;

function getRateLimitStore() {
    return getStore({
        name: 'rate-limits',
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN,
    });
}

function getClientIp(req) {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    return req.headers.get('x-nf-client-connection-ip') || 'unknown';
}

// Devolve true se o pedido pode prosseguir, false se o limite foi excedido
// para este IP dentro da janela. Falhas a ler/escrever na store nunca
// bloqueiam o pedido (fail-open) — o rate limit é uma proteção extra, não
// deve derrubar a função pública se os Blobs estiverem indisponíveis.
export async function enforceRateLimit(req, bucket, { windowMs = WINDOW_MS, max = MAX_REQUESTS } = {}) {
    const ip = getClientIp(req);
    const key = `${bucket}:${ip}`;
    const now = Date.now();

    try {
        const store = getRateLimitStore();
        const entry = await store.get(key, { type: 'json' });

        if (!entry || now - entry.windowStart > windowMs) {
            await store.setJSON(key, { windowStart: now, count: 1 });
            return true;
        }
        if (entry.count >= max) {
            return false;
        }
        await store.setJSON(key, { windowStart: entry.windowStart, count: entry.count + 1 });
        return true;
    } catch {
        return true;
    }
}
