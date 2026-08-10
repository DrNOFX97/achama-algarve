// Vai buscar vários feeds RSS do Google Notícias sobre habitação no Algarve
// (crise, habitação social, arrendamento, construção — não só a crise em
// si), junta os resultados, remove duplicados e grava os 10 itens mais
// recentes em data/noticias.json.
//
// Corrido pelo workflow .github/workflows/atualizar-noticias.yml (cron
// horário + manual). Uso local: `npm run fetch:noticias`.

import { XMLParser } from 'fast-xml-parser';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// "alojamento local Algarve" foi testada e excluída — dá sobretudo
// resultados de turismo (resorts, férias), não de habitação.
const QUERIES = [
    'crise habitacional Algarve',
    'habitação social Algarve',
    'arrendamento acessível Algarve',
    'construção habitação Algarve',
];
const MAX_ITEMS = 10;
const TITLE_SIMILARITY_THRESHOLD = 0.75;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'noticias.json');

function feedUrl(query) {
    return `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-PT&gl=PT&ceid=PT:pt`;
}

// Nota: Intl.DateTimeFormat('pt-PT', {day, month:'short', year}) combinados
// resolve, neste ICU, para um padrão totalmente numérico (peculiaridade do
// CLDR para pt-PT). Construímos a data manualmente para bater certo com o
// formato "24 Jul 2026" já usado no resto do site.
function formatDataPt(pubDate) {
    const d = new Date(pubDate);
    if (Number.isNaN(d.getTime())) return '';
    const dia = String(d.getDate()).padStart(2, '0');
    const mesAbrev = new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(d).replace('.', '');
    const mes = mesAbrev.charAt(0).toUpperCase() + mesAbrev.slice(1);
    return `${dia} ${mes} ${d.getFullYear()}`;
}

// O Google Notícias formata o título como "Título do artigo - Nome da Fonte".
// Preferimos o elemento <source>, mas separamos o título por si em caso de
// o elemento não vir preenchido.
function splitTituloFonte(title, sourceFromXml) {
    if (sourceFromXml) {
        const suffix = ` - ${sourceFromXml}`;
        if (title.endsWith(suffix)) {
            return { titulo: title.slice(0, -suffix.length).trim(), fonte: sourceFromXml };
        }
        return { titulo: title.trim(), fonte: sourceFromXml };
    }
    const idx = title.lastIndexOf(' - ');
    if (idx === -1) return { titulo: title.trim(), fonte: '' };
    return { titulo: title.slice(0, idx).trim(), fonte: title.slice(idx + 3).trim() };
}

async function fetchQuery(query) {
    const res = await fetch(feedUrl(query), {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ACIMHA-noticias-bot/1.0)' },
    });
    if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
    }
    const xml = await res.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml);

    const rawItems = parsed?.rss?.channel?.item;
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];

    return items
        .map((item) => {
            const title = String(item.title ?? '').trim();
            const sourceNode = item.source;
            const sourceText = typeof sourceNode === 'object' ? String(sourceNode['#text'] ?? '').trim() : String(sourceNode ?? '').trim();
            const { titulo, fonte } = splitTituloFonte(title, sourceText);
            const link = String(item.link ?? '').trim();
            const pubDate = item.pubDate ?? '';
            return {
                titulo,
                link,
                fonte,
                data: formatDataPt(pubDate),
                _pubDateMs: new Date(pubDate).getTime() || 0,
            };
        })
        .filter((n) => n.titulo && n.link);
}

// Alguns títulos trazem uma assinatura tipo "| Por Nome Apelido" no fim,
// o que faz o mesmo artigo, republicado por duas fontes, parecer menos
// semelhante do que é. Removemos só para efeitos de comparação — o título
// apresentado no site mantém-se exatamente como veio da fonte.
function stripByline(title) {
    return title
        .replace(/\s*[|\-–—]\s*[Pp]or\s+[A-ZÀ-ÖØ-Ý][\wÀ-ÿ'’-]*(?:\s+(?:[A-ZÀ-ÖØ-Ý][\wÀ-ÿ'’-]*|d[aeo]s?|e))*\s*$/, '')
        .trim();
}

// Normaliza para comparação: sem assinatura, minúsculas, sem acentos, sem
// pontuação.
function normalizeTitle(title) {
    return stripByline(title)
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Semelhança de Jaccard sobre o conjunto de palavras — suficiente para
// apanhar o mesmo artigo republicado com título ligeiramente diferente,
// sem trazer uma dependência de NLP só para isto.
function titleSimilarity(a, b) {
    const wordsA = new Set(normalizeTitle(a).split(' ').filter(Boolean));
    const wordsB = new Set(normalizeTitle(b).split(' ').filter(Boolean));
    if (wordsA.size === 0 || wordsB.size === 0) return 0;
    let intersection = 0;
    for (const w of wordsA) if (wordsB.has(w)) intersection += 1;
    const union = wordsA.size + wordsB.size - intersection;
    return intersection / union;
}

function dedupe(items) {
    const seenLinks = new Set();
    const kept = [];
    for (const item of items) {
        if (seenLinks.has(item.link)) continue;
        const isDupe = kept.some((k) => titleSimilarity(k.titulo, item.titulo) >= TITLE_SIMILARITY_THRESHOLD);
        if (isDupe) continue;
        seenLinks.add(item.link);
        kept.push(item);
    }
    return kept;
}

async function main() {
    const results = await Promise.allSettled(QUERIES.map(fetchQuery));

    const merged = [];
    results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
            console.log(`[fetch-noticias] "${QUERIES[i]}": ${result.value.length} itens`);
            merged.push(...result.value);
        } else {
            console.error(`[fetch-noticias] "${QUERIES[i]}" falhou: ${result.reason?.message ?? result.reason}`);
        }
    });

    if (merged.length === 0) {
        throw new Error('Nenhuma das queries devolveu itens — a não gravar data/noticias.json.');
    }

    const deduped = dedupe(merged);
    const noticias = deduped
        .sort((a, b) => b._pubDateMs - a._pubDateMs)
        .slice(0, MAX_ITEMS)
        .map(({ _pubDateMs, ...rest }) => rest);

    if (noticias.length === 0) {
        throw new Error('Nenhum item válido após o processamento — a não gravar data/noticias.json.');
    }

    const output = {
        atualizado_em: new Date().toISOString(),
        queries: QUERIES,
        noticias,
    };

    await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf-8');
    console.log(`Gravadas ${noticias.length} notícias (de ${merged.length} itens brutos, ${deduped.length} após deduplicação) em ${OUTPUT_PATH}`);
}

main().catch((err) => {
    console.error('[fetch-noticias] Erro:', err.message);
    process.exitCode = 1;
});
