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

export async function listSubmissions(formId, token) {
    return netlifyApiFetch(`/forms/${formId}/submissions`, token);
}

export async function getSubmission(submissionId, token) {
    return netlifyApiFetch(`/submissions/${submissionId}`, token);
}
