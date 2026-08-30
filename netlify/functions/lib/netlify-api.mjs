const NETLIFY_API_BASE = 'https://api.netlify.com/api/v1';

async function netlifyApiFetch(path, token) {
    const res = await fetch(`${NETLIFY_API_BASE}${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error(`Netlify API respondeu ${res.status} em ${path}`);
    }
    return res.json();
}

export async function findFormIdByName(siteId, formName, token) {
    const forms = await netlifyApiFetch(`/sites/${siteId}/forms`, token);
    const form = forms.find((f) => f.name === formName);
    return form ? form.id : null;
}

// Limitação conhecida, sinalizada em revisão de código: não pagina — devolve
// só a primeira página que a API do Netlify Forms responder. Com o volume
// atual de submissões (poucas dezenas em qualquer form) nunca se notou, mas
// se um form crescer muito, submissões mais antigas podem deixar de aparecer
// nas listagens do /admin sem aviso nenhum. Corrigir exige paginar de forma
// confirmada contra o comportamento real da API (Link header? parâmetro de
// página?) — não implementado às cegas sem poder testar contra a API real.
export async function listSubmissions(formId, token) {
    return netlifyApiFetch(`/forms/${formId}/submissions`, token);
}

export async function getSubmission(submissionId, token) {
    return netlifyApiFetch(`/submissions/${submissionId}`, token);
}

export async function deleteSubmission(submissionId, token) {
    const res = await fetch(`${NETLIFY_API_BASE}/submissions/${submissionId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
        throw new Error(`Netlify API respondeu ${res.status} ao apagar a submissão ${submissionId}`);
    }
}
