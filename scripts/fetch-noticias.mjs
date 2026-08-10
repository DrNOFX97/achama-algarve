// Vai buscar o feed RSS do Google Notícias para a crise habitacional no
// Algarve e grava os 10 itens mais recentes em data/noticias.json.
//
// Corrido pelo workflow .github/workflows/atualizar-noticias.yml (cron
// horário + manual). Uso local: `npm run fetch:noticias`.

import { XMLParser } from 'fast-xml-parser';
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const QUERY = 'crise habitacional Algarve';
const FEED_URL = `https://news.google.com/rss/search?q=${encodeURIComponent(QUERY)}&hl=pt-PT&gl=PT&ceid=PT:pt`;
const MAX_ITEMS = 10;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = path.join(__dirname, '..', 'data', 'noticias.json');

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

async function main() {
    const res = await fetch(FEED_URL, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ACIMHA-noticias-bot/1.0)' },
    });
    if (!res.ok) {
        throw new Error(`Falha ao obter o feed RSS: HTTP ${res.status}`);
    }
    const xml = await res.text();

    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const parsed = parser.parse(xml);

    const rawItems = parsed?.rss?.channel?.item;
    const items = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : [];
    if (items.length === 0) {
        throw new Error('O feed RSS não devolveu nenhum item — a não gravar data/noticias.json.');
    }

    const noticias = items
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
        .filter((n) => n.titulo && n.link)
        .sort((a, b) => b._pubDateMs - a._pubDateMs)
        .slice(0, MAX_ITEMS)
        .map(({ _pubDateMs, ...rest }) => rest);

    if (noticias.length === 0) {
        throw new Error('Nenhum item válido após o processamento — a não gravar data/noticias.json.');
    }

    const output = {
        atualizado_em: new Date().toISOString(),
        query: QUERY,
        noticias,
    };

    await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
    await writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2) + '\n', 'utf-8');
    console.log(`Gravadas ${noticias.length} notícias em ${OUTPUT_PATH}`);
}

main().catch((err) => {
    console.error('[fetch-noticias] Erro:', err.message);
    process.exitCode = 1;
});
