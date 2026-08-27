const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const loginEl = $('#admin-login');
const appEl = $('#admin-app');

function showLogin() {
    loginEl.classList.remove('is-hidden');
    appEl.classList.add('is-hidden');
}

function showApp() {
    loginEl.classList.add('is-hidden');
    appEl.classList.remove('is-hidden');
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

// Só aceita https:// ou caminhos relativos — bloqueia javascript: e outros
// esquemas perigosos em valores vindos de fontes externas (inscrições, notícias).
function safeHref(url) {
    if (typeof url === 'string' && /^(https:\/\/|\/)/.test(url)) {
        return escapeHtml(url);
    }
    return '#';
}

function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('pt-PT', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function estadoPillClass(estado) {
    if (estado === 'Aprovado') return 'is-aprovado';
    if (estado === 'Pendente aprovação') return 'is-pendente-aprovacao';
    return 'is-pendente-assinatura';
}

function setupNav() {
    const navItems = $$('.admin-nav__item');
    const panels = $$('.admin-panel');
    navItems.forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.panel;
            navItems.forEach((b) => b.classList.toggle('is-active', b === btn));
            panels.forEach((p) => p.classList.toggle('is-active', p.dataset.panel === target));
        });
    });
}

function renderStats(inscricoes, documentos) {
    const stats = [
        { label: 'Inscrições totais', value: inscricoes.length },
        {
            label: 'Pendentes assinatura CMD',
            value: inscricoes.filter((i) => i.estado === 'Pendente assinatura CMD').length,
        },
        {
            label: 'Pendentes aprovação',
            value: inscricoes.filter((i) => i.estado === 'Pendente aprovação').length,
        },
        { label: 'Documentos em falta', value: documentos.filter((d) => d.estado === 'em falta').length },
    ];

    $('#admin-stats').innerHTML = stats.map((s) => `
        <div class="admin-stat-card">
            <span class="admin-stat-card__value">${s.value}</span>
            <span class="admin-stat-card__label">${escapeHtml(s.label)}</span>
        </div>
    `).join('');
}

function renderInscricoes(inscricoes) {
    const body = $('#admin-inscricoes-body');
    const empty = $('#admin-inscricoes-empty');

    if (!inscricoes.length) {
        body.innerHTML = '';
        empty.classList.remove('is-hidden');
        return;
    }
    empty.classList.add('is-hidden');

    body.innerHTML = inscricoes.map((i) => `
        <tr>
            <td>${escapeHtml(i.nome || '—')}</td>
            <td>${escapeHtml(i.categoriaLabel || '—')}</td>
            <td>${formatDate(i.data)}</td>
            <td><span class="admin-pill ${estadoPillClass(i.estado)}">${escapeHtml(i.estado)}</span></td>
            <td>${i.pdfUrl
            ? `<a class="admin-link-action" href="${safeHref(i.pdfUrl)}" target="_blank" rel="noopener">Ver PDF</a>`
            : '—'}</td>
        </tr>
    `).join('');
}

function renderDocumentos(documentos) {
    const wrap = $('#admin-docs');
    wrap.innerHTML = documentos.map((d) => `
        <div class="admin-doc-card">
            <div class="admin-doc-card__head">
                <span class="admin-doc-card__label">${escapeHtml(d.label)}</span>
                <span class="admin-pill ${d.estado === 'publicado' ? 'is-aprovado' : 'is-pendente-assinatura'}">${escapeHtml(d.estado)}</span>
            </div>
            <p class="admin-doc-card__path">${escapeHtml(d.path)}</p>
            ${d.url ? `<a class="admin-link-action" href="${d.url}" target="_blank" rel="noopener">Ver ficheiro atual</a>` : ''}
            <form class="admin-doc-card__upload" data-document-id="${d.id}">
                <input type="file" accept="application/pdf,.pdf" required>
                <button type="submit" class="btn btn--outline-dark">Substituir</button>
                <p class="admin-doc-card__status" aria-live="polite"></p>
            </form>
        </div>
    `).join('');

    $$('.admin-doc-card__upload', wrap).forEach((form) => {
        form.addEventListener('submit', handleDocumentUpload);
    });
}

async function handleDocumentUpload(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const documentId = form.dataset.documentId;
    const fileInput = form.querySelector('input[type="file"]');
    const statusEl = form.querySelector('.admin-doc-card__status');
    const submitBtn = form.querySelector('button[type="submit"]');
    const file = fileInput.files[0];
    if (!file) return;

    statusEl.classList.remove('is-error');
    statusEl.textContent = 'A enviar...';
    submitBtn.disabled = true;

    try {
        const formData = new FormData();
        formData.append('documentId', documentId);
        formData.append('file', file);

        const res = await fetch('/.netlify/functions/upload-document', { method: 'POST', body: formData });
        const data = await res.json();

        if (!res.ok) {
            statusEl.textContent = data.error || 'Falha ao enviar o ficheiro.';
            statusEl.classList.add('is-error');
        } else {
            statusEl.innerHTML = `Pull request aberto: <a class="admin-link-action" href="${data.pullRequestUrl}" target="_blank" rel="noopener">rever no GitHub →</a>`;
            form.reset();
        }
    } catch {
        statusEl.textContent = 'Falha ao contactar o servidor.';
        statusEl.classList.add('is-error');
    } finally {
        submitBtn.disabled = false;
    }
}

async function renderNoticias() {
    const list = $('#admin-news-list');
    try {
        const res = await fetch('/data/noticias.json');
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        const noticias = data.noticias || [];

        if (!noticias.length) {
            list.innerHTML = '<li class="admin-empty">Sem notícias no feed atual.</li>';
            return;
        }

        list.innerHTML = noticias.map((n) => `
            <li class="admin-news__item">
                <a href="${safeHref(n.link)}" target="_blank" rel="noopener">${escapeHtml(n.titulo)}</a>
                <span class="admin-news__meta">${escapeHtml(n.fonte || '')} · ${escapeHtml(n.data || '')}</span>
            </li>
        `).join('');
    } catch {
        list.innerHTML = '<li class="admin-empty">Não foi possível carregar o feed de notícias.</li>';
    }
}

async function loadDashboard(email) {
    $('#admin-session-email').textContent = email;
    $('#admin-settings-email').textContent = email;

    setupNav();
    renderNoticias();

    try {
        const [inscricoesRes, documentosRes] = await Promise.all([
            fetch('/.netlify/functions/list-inscricoes'),
            fetch('/.netlify/functions/list-documents'),
        ]);

        if (!inscricoesRes.ok || !documentosRes.ok) throw new Error('Falha ao carregar dados do painel.');

        const [inscricoesData, documentosData] = await Promise.all([
            inscricoesRes.json(),
            documentosRes.json(),
        ]);

        renderStats(inscricoesData.inscricoes, documentosData.documentos);
        renderInscricoes(inscricoesData.inscricoes);
        renderDocumentos(documentosData.documentos);
    } catch {
        $('#admin-stats').innerHTML = '<p class="admin-error">Não foi possível carregar os dados do painel.</p>';
    }
}

async function init() {
    try {
        const res = await fetch('/.netlify/functions/auth-check');
        const data = await res.json();
        if (data.authenticated) {
            showApp();
            await loadDashboard(data.email);
        } else {
            showLogin();
        }
    } catch {
        showLogin();
    }
}

init();
