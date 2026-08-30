import { verifySession } from './lib/session.mjs';
import { getSubmission } from './lib/netlify-api.mjs';

export default async (req) => {
    const sessionSecret = process.env.SESSION_SECRET;
    const session = sessionSecret ? verifySession(req.headers.get('cookie'), sessionSecret) : null;
    if (!session) {
        return new Response('Não autenticado.', { status: 401 });
    }

    const submissionId = new URL(req.url).searchParams.get('submissionId');
    if (!submissionId) {
        return new Response('Parâmetro submissionId em falta.', { status: 400 });
    }

    const netlifyToken = process.env.NETLIFY_AUTH_TOKEN;
    if (!netlifyToken) {
        return new Response('Configuração em falta no servidor (NETLIFY_AUTH_TOKEN).', { status: 500 });
    }

    let submission;
    try {
        submission = await getSubmission(submissionId, netlifyToken);
    } catch {
        return new Response('Falha ao obter a submissão do Netlify Forms.', { status: 502 });
    }

    // Confirma que a submissão pertence mesmo ao formulário de queixas, para
    // este endpoint não poder ser usado para ler submissões de outras forms.
    const fileUrl = submission?.data?.foto?.url;
    if (submission?.form_name !== 'queixa-bairro' || !fileUrl) {
        return new Response('Foto não encontrada para esta submissão.', { status: 404 });
    }

    return new Response(null, { status: 302, headers: { Location: fileUrl } });
};
