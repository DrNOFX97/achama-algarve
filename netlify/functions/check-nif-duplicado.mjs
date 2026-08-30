import { findFormIdByName, listSubmissions } from './lib/netlify-api.mjs';
import { enforceRateLimit } from './lib/rate-limit.mjs';

// Pública, sem gate de sessão — chamada pelo formulário público de inscrição,
// antes do submit real, para travar o caso normal de alguém se inscrever
// duas vezes sem reparar. Não é à prova de bypass: quem submeter directamente
// ao Netlify Forms (sem passar por aqui) continua a conseguir duplicar — não
// há forma de o Netlify Forms impor uma restrição de unicidade a sério.
const NIF_PATTERN = /^\d{9}$/;

export default async (req) => {
    const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
    const siteId = process.env.NETLIFY_SITE_ID;
    if (!netlifyToken || !siteId) {
        return Response.json(
            { error: 'Configuração em falta no servidor (NETLIFY_AUTH_TOKEN / NETLIFY_SITE_ID).' },
            { status: 500 }
        );
    }

    // Impede varrer NIFs em massa (facto associativo sensível) a partir do
    // mesmo IP — o endpoint continua público por design, só limita a taxa.
    const podeContinuar = await enforceRateLimit(req, 'check-nif-duplicado');
    if (!podeContinuar) {
        return Response.json({ error: 'Demasiados pedidos. Tente novamente dentro de instantes.' }, { status: 429 });
    }

    let body;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: 'Pedido inválido — esperado JSON.' }, { status: 400 });
    }

    const nif = body.nif;
    if (typeof nif !== 'string' || !NIF_PATTERN.test(nif)) {
        return Response.json({ error: 'NIF inválido.' }, { status: 400 });
    }

    try {
        const formId = await findFormIdByName(siteId, 'inscricao', netlifyToken);
        if (!formId) {
            return Response.json({ duplicado: false }, { status: 200 });
        }
        const submissions = await listSubmissions(formId, netlifyToken);
        const duplicado = submissions.some((sub) => sub.data?.nif === nif);
        return Response.json({ duplicado }, { status: 200 });
    } catch {
        return Response.json({ error: 'Falha ao contactar a API do Netlify.' }, { status: 502 });
    }
};
