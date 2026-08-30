import { getStore } from '@netlify/blobs';

// Modo manual (siteID + token explícitos) em vez de depender da injeção
// automática do runtime — essa injeção não acontece em `netlify dev` local.
export function getInscricoesStore() {
    return getStore({
        name: 'inscricoes-admin',
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN,
    });
}

// Overrides de estado das queixas de bairro (Encaminhada/Resolvida/Apagado)
// — mesmo mecanismo e mesma razão que getInscricoesStore: o Netlify Forms
// não tem forma de editar nem apagar reversivelmente uma submissão.
export function getQueixasStore() {
    return getStore({
        name: 'queixas-admin',
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN,
    });
}

// Tokens de retomar a assinatura (create-inscricao-token.mjs /
// resolve-inscricao-token.mjs) — store separada da dos overrides do painel
// admin, porque é escrita e lida por funções públicas, sem sessão.
export function getInscricaoTokensStore() {
    return getStore({
        name: 'inscricao-tokens',
        siteID: process.env.NETLIFY_SITE_ID,
        token: process.env.NETLIFY_AUTH_TOKEN,
    });
}
