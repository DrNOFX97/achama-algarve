const GITHUB_API_BASE = 'https://api.github.com';
export const OWNER = 'DrNOFX97';
export const REPO = 'acimha';
export const DEFAULT_BRANCH = 'main';

async function githubFetch(path, token, init = {}) {
    return fetch(`${GITHUB_API_BASE}${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28',
            ...(init.headers || {}),
        },
    });
}

// Devolve os metadados do ficheiro (incluindo o "sha" necessário para o
// substituir) ou null se não existir no branch indicado.
export async function getFileMeta(repoPath, token, ref = DEFAULT_BRANCH) {
    const res = await githubFetch(`/repos/${OWNER}/${REPO}/contents/${repoPath}?ref=${ref}`, token);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API respondeu ${res.status} ao obter ${repoPath}`);
    return res.json();
}

export async function getRefSha(branch, token) {
    const res = await githubFetch(`/repos/${OWNER}/${REPO}/git/ref/heads/${branch}`, token);
    if (!res.ok) throw new Error(`GitHub API respondeu ${res.status} ao obter o branch ${branch}`);
    const data = await res.json();
    return data.object.sha;
}

export async function createBranch(branchName, fromSha, token) {
    const res = await githubFetch(`/repos/${OWNER}/${REPO}/git/refs`, token, {
        method: 'POST',
        body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: fromSha }),
    });
    if (!res.ok) throw new Error(`GitHub API respondeu ${res.status} ao criar o branch ${branchName}`);
    return res.json();
}

// existingSha: passa o "sha" atual do ficheiro quando estás a substituí-lo;
// omite quando é um ficheiro novo nesse caminho.
export async function putFile(repoPath, contentBase64, message, branch, token, existingSha) {
    const res = await githubFetch(`/repos/${OWNER}/${REPO}/contents/${repoPath}`, token, {
        method: 'PUT',
        body: JSON.stringify({
            message,
            content: contentBase64,
            branch,
            ...(existingSha ? { sha: existingSha } : {}),
        }),
    });
    if (!res.ok) throw new Error(`GitHub API respondeu ${res.status} ao escrever ${repoPath}`);
    return res.json();
}

export async function createPullRequest(title, body, head, base, token) {
    const res = await githubFetch(`/repos/${OWNER}/${REPO}/pulls`, token, {
        method: 'POST',
        body: JSON.stringify({ title, body, head, base }),
    });
    if (!res.ok) throw new Error(`GitHub API respondeu ${res.status} ao criar o pull request`);
    return res.json();
}
