import { verifySession } from './lib/session.mjs';
import { getFileMeta } from './lib/github-api.mjs';
import { DOCUMENTS } from './lib/documents.mjs';

export default async (req) => {
    const sessionSecret = process.env.SESSION_SECRET;
    const session = sessionSecret ? verifySession(req.headers.get('cookie'), sessionSecret) : null;
    if (!session) {
        return Response.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
        return Response.json({ error: 'Configuração em falta no servidor (GITHUB_TOKEN).' }, { status: 500 });
    }

    let documentos;
    try {
        documentos = await Promise.all(
            DOCUMENTS.map(async (doc) => {
                const meta = await getFileMeta(doc.path, githubToken);
                return {
                    id: doc.id,
                    label: doc.label,
                    path: doc.path,
                    estado: meta ? 'publicado' : 'em falta',
                    url: meta ? `https://acimha.pt/${doc.path}` : null,
                };
            })
        );
    } catch {
        return Response.json({ error: 'Falha ao contactar a API do GitHub.' }, { status: 502 });
    }

    return Response.json({ documentos }, { status: 200 });
};
