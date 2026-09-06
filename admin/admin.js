import { gerarFichaDocx } from '../js/modules/inscricao-docx.js';

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

function formatMonthLabel(d) {
    return d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' }).replace('.', '');
}

// SVG donut à mão (sem biblioteca) — um círculo por segmento, usando
// stroke-dasharray/offset em vez de arcos, com um gap de 2px em surface
// entre segmentos (spacer da skill de dataviz).
function svgDonutSegment({ cx, cy, r, circumference, offset, length, color, gapDeg }) {
    const gapLen = (gapDeg / 360) * circumference;
    const dash = Math.max(length - gapLen, 0);
    return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="20"
        stroke-dasharray="${dash} ${circumference - dash}"
        stroke-dashoffset="${-offset}"
        transform="rotate(-90 ${cx} ${cy})"></circle>`;
}

function estadoPillClass(estado) {
    if (estado === 'Aprovado' || estado === 'Resolvida') return 'is-aprovado';
    if (estado === 'Pendente aprovação' || estado === 'Pendente') return 'is-pendente-aprovacao';
    if (estado === 'Encaminhada') return 'is-encaminhada';
    if (estado === 'Apagado') return 'is-apagado';
    return 'is-pendente-assinatura';
}

// Alterna entre a lista ativa e a de soft-deleted ("Apagado"), disponível
// para restaurar — uma flag por tabela (inscrições/queixas).
let mostrarApagados = false;
let mostrarQueixasApagadas = false;

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

function renderStats(inscricoes, documentos, queixas) {
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
        { label: 'Queixas pendentes', value: queixas.filter((q) => q.estado === 'Pendente').length },
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
        empty.textContent = mostrarApagados ? 'Sem inscrições apagadas.' : 'Ainda não há inscrições.';
        empty.classList.remove('is-hidden');
        return;
    }
    empty.classList.add('is-hidden');

    body.innerHTML = inscricoes.map((i) => {
        const id = escapeHtml(i.id);
        const nome = escapeHtml(i.nome || 'esta inscrição');
        const acoes = mostrarApagados
            ? `<button type="button" class="admin-link-action" data-action="restaurar" data-id="${id}">Restaurar</button>`
            : `
                <button type="button" class="admin-link-action" data-action="detalhes" data-id="${id}">Ver detalhes</button>
                ${!i.pdfUrl
                    ? `<button type="button" class="admin-link-action" data-action="enviar-documento" data-id="${id}">Enviar documento para assinar</button>
                <button type="button" class="admin-link-action" data-action="copiar-link" data-id="${id}">Copiar link de assinatura</button>`
                    : ''}
                ${i.estado === 'Aprovado'
                    ? `<button type="button" class="admin-link-action" data-action="reverter" data-id="${id}">Reverter</button>`
                    : `<button type="button" class="admin-link-action" data-action="aprovar" data-id="${id}">Marcar Aprovado</button>`}
                <button type="button" class="admin-link-action admin-link-action--danger" data-action="apagar" data-id="${id}" data-nome="${nome}">Apagar</button>
            `;
        return `
        <tr>
            <td>${escapeHtml(i.nome || '—')}</td>
            <td>${escapeHtml(i.categoriaLabel || '—')}</td>
            <td>${formatDate(i.data)}</td>
            <td><span class="admin-pill ${estadoPillClass(i.estado)}">${escapeHtml(i.estado)}</span></td>
            <td>
                <div class="admin-row-actions">
                    ${i.pdfUrl ? `<a class="admin-link-action" href="${safeHref(i.pdfUrl)}" target="_blank" rel="noopener">Ver PDF</a>` : ''}
                    ${acoes}
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

// Wraps fetch para as ações do painel: nunca rejeita (rede ou resposta
// não-ok são ambas tratadas aqui), e avisa o admin com o erro devolvido pelo
// servidor em vez de deixar a ação falhar em silêncio — antes disto, um 400
// ou 401 era ignorado e a lista voltava a carregar como se nada tivesse
// mudado, sem indicação nenhuma de que a ação não aconteceu.
async function postAdminAction(url, body) {
    try {
        const res = await fetch(url, { method: 'POST', body: JSON.stringify(body) });
        if (!res.ok) {
            let message = 'Falha ao executar a ação.';
            try {
                const data = await res.json();
                if (data?.error) message = data.error;
            } catch { /* corpo sem JSON válido — mantém a mensagem genérica */ }
            alert(message);
        }
    } catch {
        alert('Falha ao contactar o servidor.');
    }
}

async function openInscricaoModal(inscricao) {
    const modal = $('#admin-inscricao-modal');
    const form = $('#admin-inscricao-modal-form');
    const idInput = $('#admin-inscricao-modal-id');

    idInput.value = inscricao.id;

    // Preenche os campos do modal com os dados da inscrição
    ['nome', 'email', 'telefone', 'nif', 'cc_bi', 'data_nascimento', 'morada',
     'codigo_postal', 'localidade', 'concelho', 'distrito', 'profissao',
     'meio_comunicacao', 'categoria'].forEach((field) => {
        const input = form.elements[field];
        if (input) input.value = inscricao[field] || '';
    });

    $('#admin-inscricao-modal-status').textContent = '';
    modal.classList.remove('is-hidden');
}

function closeInscricaoModal() {
    const modal = $('#admin-inscricao-modal');
    modal.classList.add('is-hidden');
}

async function handleInscricaoModalSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const idInput = $('#admin-inscricao-modal-id');
    const statusEl = $('#admin-inscricao-modal-status');
    const id = idInput.value;

    const formData = new FormData(form);
    const dados = {};
    ['nome', 'email', 'telefone', 'nif', 'cc_bi', 'data_nascimento', 'morada',
     'codigo_postal', 'localidade', 'concelho', 'distrito', 'profissao',
     'meio_comunicacao', 'categoria'].forEach((field) => {
        const value = formData.get(field);
        if (value) dados[field] = value;
    });

    try {
        const res = await fetch('/.netlify/functions/update-inscricao-dados', {
            method: 'POST',
            body: JSON.stringify({ id, dados }),
        });

        if (!res.ok) {
            let message = 'Falha ao guardar as alterações.';
            try {
                const data = await res.json();
                if (data?.error) message = data.error;
            } catch { /* corpo sem JSON válido — mantém a mensagem genérica */ }
            statusEl.textContent = message;
            return;
        }

        statusEl.textContent = 'Guardado com sucesso!';
        await new Promise((r) => setTimeout(r, 1500));
        closeInscricaoModal();
        await refreshInscricoes();
    } catch {
        statusEl.textContent = 'Falha ao contactar o servidor.';
    }
}

async function copyAssinaturLink(inscricao) {
    // O token é criado quando o utilizador pede para assinar por email;
    // para copiar o link de retoma, precisa da função create-inscricao-token.
    try {
        const res = await fetch('/.netlify/functions/create-inscricao-token', {
            method: 'POST',
            body: JSON.stringify({ submissionId: inscricao.id }),
        });

        if (!res.ok) {
            let message = 'Falha ao gerar o link de assinatura.';
            try {
                const data = await res.json();
                if (data?.error) message = data.error;
            } catch { /* corpo sem JSON válido */ }
            alert(message);
            return;
        }

        const data = await res.json();
        const url = `${window.location.origin}/assinatura.html?token=${data.token}`;
        await navigator.clipboard.writeText(url);
        alert(`Link copiado para a área de transferência:\n${url}`);
    } catch {
        alert('Falha ao contactar o servidor.');
    }
}

// Reenvia (ou envia pela primeira vez) o email com a ficha em .docx e o
// link de assinatura — para quando o utilizador teve problemas a receber o
// email original, ou para inscrições antigas que nunca chegaram a recebê-lo
// (ex.: antes do SMTP estar configurado). Gera o documento a partir dos
// dados já guardados da inscrição, não pede nada de novo ao utilizador.
async function enviarDocumentoParaAssinar(inscricao, btn) {
    if (btn) { btn.disabled = true; btn.textContent = 'A enviar...'; }
    try {
        const tokenRes = await fetch('/.netlify/functions/create-inscricao-token', {
            method: 'POST',
            body: JSON.stringify({ submissionId: inscricao.id }),
        });
        if (!tokenRes.ok) {
            let message = 'Falha ao gerar o link de assinatura.';
            try {
                const data = await tokenRes.json();
                if (data?.error) message = data.error;
            } catch { /* corpo sem JSON válido */ }
            alert(message);
            return;
        }
        const { token } = await tokenRes.json();

        const dados = {
            tipo_associado: inscricao.categoria,
            nome: inscricao.nome,
            data_nascimento: inscricao.data_nascimento,
            nif: inscricao.nif,
            cc_bi: inscricao.cc_bi,
            morada: inscricao.morada,
            codigo_postal: inscricao.codigo_postal,
            localidade: inscricao.localidade,
            concelho: inscricao.concelho,
            distrito: inscricao.distrito,
            telefone: inscricao.telefone,
            email: inscricao.email,
            profissao: inscricao.profissao,
            meio_comunicacao: inscricao.meio_comunicacao,
            aceita_estatutos: inscricao.aceita_estatutos,
            autoriza_dados: inscricao.autoriza_dados,
            local: inscricao.local,
            data_inscricao: inscricao.data_inscricao,
        };

        const doc = await gerarFichaDocx(dados);
        if (!doc.ok) {
            alert('Falha ao gerar o documento: ' + (doc.error?.message || doc.error || 'erro desconhecido'));
            return;
        }

        const arrayBuffer = await doc.blob.arrayBuffer();
        const docxBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

        const sendRes = await fetch('/.netlify/functions/send-inscricao-docx', {
            method: 'POST',
            body: JSON.stringify({ email: inscricao.email, nome: inscricao.nome, token, filename: doc.filename, docxBase64 }),
        });
        const sendData = await sendRes.json().catch(() => ({}));

        if (!sendRes.ok || !sendData.sent) {
            alert(sendData.error || 'Falha ao enviar o email.');
            return;
        }

        alert(`Documento enviado para ${inscricao.email}.`);
    } catch {
        alert('Falha ao contactar o servidor.');
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Enviar documento para assinar'; }
    }
}

async function handleInscricoesRowAction(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id, nome } = btn.dataset;

    if (action === 'detalhes') {
        const inscricao = ultimasInscricoes.find((i) => i.id === id);
        if (inscricao) openInscricaoModal(inscricao);
        return;
    }

    if (action === 'copiar-link') {
        const inscricao = ultimasInscricoes.find((i) => i.id === id);
        if (inscricao) await copyAssinaturLink(inscricao);
        return;
    }

    if (action === 'enviar-documento') {
        const inscricao = ultimasInscricoes.find((i) => i.id === id);
        if (inscricao) await enviarDocumentoParaAssinar(inscricao, btn);
        return;
    }

    if (action === 'aprovar' || action === 'reverter' || action === 'restaurar') {
        btn.disabled = true;
        await postAdminAction('/.netlify/functions/update-inscricao-estado', { id, estado: action === 'aprovar' ? 'Aprovado' : null });
        await refreshInscricoes();
        return;
    }

    if (action === 'apagar') {
        const confirmado = confirm(`Apagar a inscrição de ${nome}? Fica escondida da lista, mas pode ser restaurada em "Ver apagadas".`);
        if (!confirmado) return;
        btn.disabled = true;
        await postAdminAction('/.netlify/functions/delete-inscricao', { id });
        await refreshInscricoes();
    }
}

function renderQueixas(queixas) {
    const body = $('#admin-queixas-body');
    const empty = $('#admin-queixas-empty');

    if (!queixas.length) {
        body.innerHTML = '';
        empty.textContent = mostrarQueixasApagadas ? 'Sem queixas apagadas.' : 'Ainda não há queixas.';
        empty.classList.remove('is-hidden');
        return;
    }
    empty.classList.add('is-hidden');

    body.innerHTML = queixas.map((q) => {
        const id = escapeHtml(q.id);
        const nome = escapeHtml(q.nome || 'esta queixa');
        let acoes;
        if (mostrarQueixasApagadas) {
            acoes = `<button type="button" class="admin-link-action" data-action="restaurar" data-id="${id}">Restaurar</button>`;
        } else {
            const botoes = [];
            if (q.estado !== 'Encaminhada') {
                botoes.push(`<button type="button" class="admin-link-action" data-action="encaminhar" data-id="${id}">Marcar Encaminhada</button>`);
            }
            if (q.estado !== 'Resolvida') {
                botoes.push(`<button type="button" class="admin-link-action" data-action="resolver" data-id="${id}">Marcar Resolvida</button>`);
            }
            if (q.estado !== 'Pendente') {
                botoes.push(`<button type="button" class="admin-link-action" data-action="reverter" data-id="${id}">Reverter</button>`);
            }
            botoes.push(`<button type="button" class="admin-link-action admin-link-action--danger" data-action="apagar" data-id="${id}" data-nome="${nome}">Apagar</button>`);
            acoes = botoes.join('');
        }
        return `
        <tr>
            <td>${escapeHtml(q.nome || '—')}</td>
            <td>${escapeHtml(q.concelho || '—')}</td>
            <td title="${escapeHtml(q.descricao || '')}">${escapeHtml(q.tipoLabel || '—')}</td>
            <td>${formatDate(q.data)}</td>
            <td><span class="admin-pill ${estadoPillClass(q.estado)}">${escapeHtml(q.estado)}</span></td>
            <td>
                <div class="admin-row-actions">
                    ${q.fotoUrl ? `<a class="admin-link-action" href="${safeHref(q.fotoUrl)}" target="_blank" rel="noopener">Ver foto</a>` : ''}
                    ${acoes}
                </div>
            </td>
        </tr>
    `;
    }).join('');
}

async function handleQueixasRowAction(e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id, nome } = btn.dataset;

    const ESTADOS = { encaminhar: 'Encaminhada', resolver: 'Resolvida', reverter: null, restaurar: null };
    if (action in ESTADOS) {
        btn.disabled = true;
        await postAdminAction('/.netlify/functions/update-queixa-estado', { id, estado: ESTADOS[action] });
        await refreshQueixas();
        return;
    }

    if (action === 'apagar') {
        const confirmado = confirm(`Apagar a queixa de ${nome}? Fica escondida da lista, mas pode ser restaurada em "Ver apagadas".`);
        if (!confirmado) return;
        btn.disabled = true;
        await postAdminAction('/.netlify/functions/delete-queixa', { id });
        await refreshQueixas();
    }
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

// Cores validadas com o script de acessibilidade da skill de dataviz para
// este par (contraste, distinção CVD) — não trocar sem revalidar.
const CATEGORIA_COLORS = {
    civico: '#2a78d6',
    habitacional: '#eb6834',
};
const CATEGORIA_COLOR_FALLBACK = '#6B6B5F'; // --color-muted, só se aparecer uma categoria nova

function renderTimelineChart(inscricoes) {
    const el = $('#admin-chart-timeline');
    if (!inscricoes.length) {
        el.innerHTML = '<p class="admin-empty">Sem inscrições ainda.</p>';
        return;
    }

    const datas = inscricoes.map((i) => new Date(i.data)).sort((a, b) => a - b);
    const primeira = new Date(datas[0].getFullYear(), datas[0].getMonth(), 1);
    const agora = new Date();
    const meses = [];
    for (let d = new Date(primeira); d <= agora; d.setMonth(d.getMonth() + 1)) {
        meses.push(new Date(d));
    }

    const acumulado = meses.map((mesInicio) => {
        const fimDoMes = new Date(mesInicio.getFullYear(), mesInicio.getMonth() + 1, 1);
        return datas.filter((d) => d < fimDoMes).length;
    });

    const w = 560;
    const h = 220;
    const padL = 32;
    const padB = 28;
    const padT = 16;
    const padR = 16;
    const plotW = w - padL - padR;
    const plotH = h - padT - padB;
    const maxY = Math.max(acumulado[acumulado.length - 1], 1);

    const x = (i) => padL + (meses.length === 1 ? plotW / 2 : (i / (meses.length - 1)) * plotW);
    const y = (v) => padT + plotH - (v / maxY) * plotH;

    const pontos = acumulado.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const ultimo = acumulado[acumulado.length - 1];

    // Rótulos de mês esparsos — no máximo ~6, para não sobrepor.
    const passo = Math.max(1, Math.ceil(meses.length / 6));
    const eixoX = meses.map((m, i) => (
        i % passo === 0 || i === meses.length - 1
            ? `<text x="${x(i)}" y="${h - 8}" class="admin-chart__axis-label" text-anchor="middle">${escapeHtml(formatMonthLabel(m))}</text>`
            : ''
    )).join('');

    el.innerHTML = `
        <h2 class="admin-chart__title">Inscrições ao longo do tempo</h2>
        <svg viewBox="0 0 ${w} ${h}" class="admin-chart__svg" role="img" aria-label="Total acumulado de inscrições por mês, de ${formatMonthLabel(meses[0])} a ${formatMonthLabel(meses[meses.length - 1])}, terminando em ${ultimo}.">
            <line x1="${padL}" y1="${padT + plotH}" x2="${w - padR}" y2="${padT + plotH}" class="admin-chart__axis"></line>
            <polyline points="${pontos}" fill="none" class="admin-chart__line"></polyline>
            <circle cx="${x(acumulado.length - 1)}" cy="${y(ultimo)}" r="4" class="admin-chart__dot"></circle>
            <text x="${x(acumulado.length - 1)}" y="${y(ultimo) - 10}" class="admin-chart__value-label" text-anchor="end">${ultimo}</text>
            ${eixoX}
        </svg>
    `;
}

function renderCategoriasDonut(inscricoes) {
    const el = $('#admin-chart-categorias');
    if (!inscricoes.length) {
        el.innerHTML = '<p class="admin-empty">Sem inscrições ainda.</p>';
        return;
    }

    const porCategoria = new Map();
    inscricoes.forEach((i) => {
        const key = i.categoria || 'outra';
        const label = i.categoriaLabel || 'Outra';
        const entry = porCategoria.get(key) || { label, count: 0, color: CATEGORIA_COLORS[key] || CATEGORIA_COLOR_FALLBACK };
        entry.count += 1;
        porCategoria.set(key, entry);
    });

    const total = inscricoes.length;
    const cx = 90;
    const cy = 90;
    const r = 70;
    const circumference = 2 * Math.PI * r;
    const gapDeg = 3;

    let offset = 0;
    const segmentos = [...porCategoria.values()].map((entry) => {
        const length = (entry.count / total) * circumference;
        const svg = svgDonutSegment({ cx, cy, r, circumference, offset, length, color: entry.color, gapDeg });
        offset += length;
        return svg;
    }).join('');

    const legenda = [...porCategoria.values()].map((entry) => `
        <li class="admin-chart__legend-item">
            <span class="admin-chart__swatch" style="background:${entry.color}"></span>
            ${escapeHtml(entry.label)} — ${entry.count}
        </li>
    `).join('');

    el.innerHTML = `
        <h2 class="admin-chart__title">Categorias de sócio</h2>
        <div class="admin-chart__donut-wrap">
            <svg viewBox="0 0 180 180" class="admin-chart__donut" role="img" aria-label="Distribuição de ${total} inscrições por categoria de sócio.">
                ${segmentos}
                <text x="${cx}" y="${cy - 4}" text-anchor="middle" class="admin-chart__donut-total">${total}</text>
                <text x="${cx}" y="${cy + 14}" text-anchor="middle" class="admin-chart__donut-total-label">inscrições</text>
            </svg>
            <ul class="admin-chart__legend">${legenda}</ul>
        </div>
    `;
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

let ultimosDocumentos = [];
let ultimasInscricoes = [];
let ultimasQueixas = [];

async function refreshInscricoes() {
    try {
        const url = mostrarApagados
            ? '/.netlify/functions/list-inscricoes?apagados=1'
            : '/.netlify/functions/list-inscricoes';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Falha ao recarregar inscrições.');
        const data = await res.json();
        renderInscricoes(data.inscricoes);
        // Estatísticas e gráficos refletem sempre as listas ativas — não
        // recalcular a partir da vista de apagadas.
        if (!mostrarApagados) {
            ultimasInscricoes = data.inscricoes;
            renderStats(ultimasInscricoes, ultimosDocumentos, ultimasQueixas);
            renderTimelineChart(ultimasInscricoes);
            renderCategoriasDonut(ultimasInscricoes);
        }
    } catch {
        // A lista/gráficos ficam com os últimos dados válidos em ecrã.
    }
}

async function refreshQueixas() {
    try {
        const url = mostrarQueixasApagadas
            ? '/.netlify/functions/list-queixas?apagados=1'
            : '/.netlify/functions/list-queixas';
        const res = await fetch(url);
        if (!res.ok) throw new Error('Falha ao recarregar queixas.');
        const data = await res.json();
        renderQueixas(data.queixas);
        if (!mostrarQueixasApagadas) {
            ultimasQueixas = data.queixas;
            renderStats(ultimasInscricoes, ultimosDocumentos, ultimasQueixas);
        }
    } catch {
        // A lista fica com os últimos dados válidos em ecrã.
    }
}

async function loadDashboard(email) {
    $('#admin-session-email').textContent = email;
    $('#admin-settings-email').textContent = email;

    setupNav();
    renderNoticias();
    $('#admin-inscricoes-body').addEventListener('click', handleInscricoesRowAction);
    $('#admin-toggle-apagados').addEventListener('click', async (e) => {
        mostrarApagados = !mostrarApagados;
        e.target.textContent = mostrarApagados ? 'Ver ativas' : 'Ver apagadas';
        await refreshInscricoes();
    });

    // Setup modal de edição de inscrição
    $('#admin-inscricao-modal-form').addEventListener('submit', handleInscricaoModalSubmit);
    $('#admin-inscricao-modal-close').addEventListener('click', closeInscricaoModal);
    $('#admin-inscricao-modal-cancel').addEventListener('click', closeInscricaoModal);
    $('#admin-inscricao-modal').addEventListener('click', (e) => {
        if (e.target.id === 'admin-inscricao-modal') closeInscricaoModal();
    });

    $('#admin-queixas-body').addEventListener('click', handleQueixasRowAction);
    $('#admin-toggle-queixas-apagadas').addEventListener('click', async (e) => {
        mostrarQueixasApagadas = !mostrarQueixasApagadas;
        e.target.textContent = mostrarQueixasApagadas ? 'Ver ativas' : 'Ver apagadas';
        await refreshQueixas();
    });

    try {
        const [inscricoesRes, documentosRes, queixasRes] = await Promise.all([
            fetch('/.netlify/functions/list-inscricoes'),
            fetch('/.netlify/functions/list-documents'),
            fetch('/.netlify/functions/list-queixas'),
        ]);

        if (!inscricoesRes.ok || !documentosRes.ok || !queixasRes.ok) throw new Error('Falha ao carregar dados do painel.');

        const [inscricoesData, documentosData, queixasData] = await Promise.all([
            inscricoesRes.json(),
            documentosRes.json(),
            queixasRes.json(),
        ]);

        ultimosDocumentos = documentosData.documentos;
        ultimasInscricoes = inscricoesData.inscricoes;
        ultimasQueixas = queixasData.queixas;
        renderStats(ultimasInscricoes, ultimosDocumentos, ultimasQueixas);
        renderInscricoes(ultimasInscricoes);
        renderQueixas(ultimasQueixas);
        renderDocumentos(documentosData.documentos);
        renderTimelineChart(ultimasInscricoes);
        renderCategoriasDonut(ultimasInscricoes);
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
