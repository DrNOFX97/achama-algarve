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
