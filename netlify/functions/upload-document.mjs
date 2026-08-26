import { verifySession } from './lib/session.mjs';
import {
    getFileMeta,
    getRefSha,
    createBranch,
    putFile,
    createPullRequest,
    DEFAULT_BRANCH,
} from './lib/github-api.mjs';
import { DOCUMENTS } from './lib/documents.mjs';

const MAX_FILE_BYTES = 8 * 1024 * 1024; // margem confortável para o payload da function e da API do GitHub
const PDF_SIGNATURE = '%PDF-';

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

    let formData;
    try {
        formData = await req.formData();
    } catch {
        return Response.json({ error: 'Pedido inválido — esperado multipart/form-data.' }, { status: 400 });
    }

    const documentId = formData.get('documentId');
    const file = formData.get('file');

    const doc = DOCUMENTS.find((d) => d.id === documentId);
    if (!doc) {
        return Response.json({ error: 'documentId desconhecido.' }, { status: 400 });
    }

    if (!(file instanceof File) || file.size === 0) {
        return Response.json({ error: 'Ficheiro em falta.' }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
        return Response.json(
            { error: `O ficheiro excede o limite de ${MAX_FILE_BYTES / 1024 / 1024}MB.` },
            { status: 400 }
        );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.subarray(0, 5).toString('utf8') !== PDF_SIGNATURE) {
        return Response.json({ error: 'O ficheiro não parece ser um PDF válido.' }, { status: 400 });
    }

    const branchName = `admin/update-${doc.id}-${Date.now()}`;

    try {
        const [baseSha, existingFile] = await Promise.all([
            getRefSha(DEFAULT_BRANCH, githubToken),
            getFileMeta(doc.path, githubToken),
        ]);

        await createBranch(branchName, baseSha, githubToken);

        await putFile(
            doc.path,
            buffer.toString('base64'),
            `docs: atualizar ${doc.label} via painel admin`,
            branchName,
            githubToken,
            existingFile ? existingFile.sha : undefined
        );

        const pr = await createPullRequest(
            `docs: atualizar ${doc.label}`,
            `Novo ficheiro para \`${doc.path}\`, submetido através do painel de administração por ${session.email}.\n\nRevê o PDF antes de fazer merge — este PR não vai para produção sozinho.`,
            branchName,
            DEFAULT_BRANCH,
            githubToken
        );

        return Response.json({ pullRequestUrl: pr.html_url }, { status: 200 });
    } catch {
        return Response.json({ error: 'Falha ao criar o pull request no GitHub.' }, { status: 502 });
    }
};
