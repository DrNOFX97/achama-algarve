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

// Só o valor que o próprio Netlify injeta — `x-forwarded-for` vem do
// cliente e pode ser forjado a cada pedido, o que anulava o throttling
// (bastava um IP diferente por pedido).
function getClientIp(req) {
    return req.headers.get('x-nf-client-connection-ip') || 'unknown';
}

// Devolve true se o pedido pode prosseguir, false se o limite foi excedido
// para este IP dentro da janela, ou se a store falhou a ler/escrever
// (fail-closed: este endpoint protege um facto associativo sensível, por
// isso uma falha na proteção nunca deve reabrir o acesso sem limite — o
// caller no browser (inscricao-modal.js) já trata qualquer resposta não-ok
// como "deixar submeter", por isso isto não bloqueia inscrições legítimas,
// só fecha a via de um atacante a contornar o limite via falha induzida).
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
        return false;
    }
}
