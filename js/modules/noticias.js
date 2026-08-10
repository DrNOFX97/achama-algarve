// Preenche a secção #noticias a partir de data/noticias.json, gerado
// periodicamente pelo workflow .github/workflows/atualizar-noticias.yml
// (scripts/fetch-noticias.mjs). Ver CLAUDE.md para o desenho geral.

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
}

function renderNoticias(list, noticias) {
    list.innerHTML = noticias.map((n) => `
        <article class="news-feature__row">
          <div class="noticia-card__meta">
            <span class="noticia-card__cat">${escapeHtml(n.fonte || 'Notícia')}</span>
            <span class="noticia-card__date">${escapeHtml(n.data || '')}</span>
          </div>
          <h3 class="project-card__title">
            <a href="${escapeHtml(n.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(n.titulo)}</a>
          </h3>
        </article>
    `).join('');
}

function renderUpdated(updatedEl, isoDate) {
    if (!updatedEl || !isoDate) return;
    const d = new Date(isoDate);
    if (Number.isNaN(d.getTime())) return;
    const formatted = new Intl.DateTimeFormat('pt-PT', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    }).format(d);
    updatedEl.textContent = `Última atualização: ${formatted}`;
}

function renderError(list, updatedEl) {
    list.innerHTML = '<p class="news-feature__error">Não foi possível carregar as notícias mais recentes de momento. Tente novamente mais tarde.</p>';
    if (updatedEl) updatedEl.textContent = '';
}

export async function initNoticias() {
    const list = document.getElementById('noticias-list');
    const updatedEl = document.getElementById('noticias-updated');
    if (!list) return;

    try {
        const res = await fetch('data/noticias.json', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!Array.isArray(data.noticias) || data.noticias.length === 0) {
            throw new Error('Sem notícias no ficheiro.');
        }
        renderNoticias(list, data.noticias);
        renderUpdated(updatedEl, data.atualizado_em);
    } catch (err) {
        console.error('[noticias] Falha ao carregar data/noticias.json:', err);
        renderError(list, updatedEl);
    }
}
