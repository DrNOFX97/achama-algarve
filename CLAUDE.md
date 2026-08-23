# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**ACIMHA** (Associação Cívica de Munícipes e Habitação do Algarve) is a Portuguese civic association website. It is a **static multi-page site** — no build process, no bundler, no backend. `index.html` is the main single-page site; `politica-privacidade.html` and `termos-condicoes.html` are separate standalone legal pages that share the same stylesheet.

**ACIMHA is a general civic association, not a single-issue housing group** — this shapes copy across the whole site, so get it right before editing hero/mission/project text. It acts on four axes: Tertúlias (community debates), Queixas de Bairro (neighbourhood-complaint routing), Participação Cívica (mobilizing residents, liaising with municipalities), and Habitação a Custo Reduzido (affordable housing — the most developed axis, with three concrete projects: Clínica de Habitação, Observatório da Habitação, Algarve Cohabita). The hero (`#inicio`) and the Missão pillars (`#missao`) are what carry the non-housing axes — `#missao` presents all four axes as numbered pillars (01–04), so that section is the one to keep in sync if the axes change. The Projetos section (`#projetos`) covers only the three concrete housing projects; a duplicate "Outras Frentes de Atuação" block that repeated the `#missao` copy for the other three axes was removed from `#projetos` as redundant. Don't revert `#missao`/`#inicio` to housing-only framing when touching this copy.

## Running Locally

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

Or open `index.html` directly in a browser. The site itself needs no compilation or install. There is no lint or test command — verify changes by loading the page and exercising the interactive elements (nav, modals, tabs, forms, Observatory).

The one exception is the news fetcher (see below): `npm install` pulls in `fast-xml-parser`, needed only to run `scripts/fetch-noticias.mjs`. Nothing under `node_modules/` is loaded by the browser.

## Architecture

### Only some CSS/JS files are actually loaded — check `<head>`/`<body>` before assuming

`index.html` links exactly four stylesheets and one script:

```html
css/main.css
css/components/forms.css
css/components/inscricao.css
css/components/contact-modal.css
js/app.js  (type="module")
```

`css/main.css` is the real monolith: it holds the `:root` design tokens, the reset, and styling for nav, hero, every page section, tabs, footer, and the Observatory modal. The three `css/components/*.css` files each own one specific form surface (generic form fields, the "Ficha de Inscrição" modal, the contact modal). **This repo has a history of orphaned CSS files** (a past refactor left several component stylesheets on disk that were never `<link>`ed, causing silent visual bugs — hero typography, card color variants, and the nav CTA's responsive visibility were all broken for a while because their rules lived in unlinked files). Old/experimental logo artwork lives in `assets/images/logos_old/` and is not referenced anywhere. If you add or split a stylesheet, link it in `index.html` and delete the dead file — don't leave presentational rules for the next person to rediscover unlinked.

### JavaScript: ES modules, one entry point

`js/app.js` is loaded as `type="module"` and imports each feature from `js/modules/` (`ui-utils.js`, `forms.js`, `tabs.js`, `observatory.js`, `inscricao-modal.js`, `contact-modal.js`) plus the static dataset `js/data/observatory-data.js`. Every feature is wrapped in a `safe(() => ...)` try/catch in `app.js` so one module throwing doesn't break the rest of the page.

### Design system: Monocle Magazine editorial style

The site was overhauled to an editorial-magazine visual language (cream/ink/red palette, serif type, hairline rules, numbered feature lists) — see the CSS custom properties at the top of `css/main.css`:

- `--color-bg` (cream `#F2EFE7`), `--color-primary` (ink, doubles as body text), `--color-accent` (editorial red), `--color-olive`, `--color-hairline`
- `--font-heading` (Playfair Display), `--font-body` (Source Serif 4, for body copy), `--font-sans` (Source Sans 3, **only** for small uppercase kickers/labels — not body text)
- `--radius*` are all `0` and `--shadow-*` are all `none` site-wide — the design language has no rounded corners, no drop shadows, and (outside the Observatory's semantic data colors) no decorative gradients. Match this when adding UI rather than reintroducing card/shadow/gradient patterns.
- Repeated content blocks (crisis stats, projects, news, ways to participate) use the shared `.stats-feature` / `.stats-feature__row` numbered-row pattern instead of card grids — reuse it for new list-like content instead of building a new card component.
- Decorative emoji icons were removed in favor of serif numerals or small square accent marks; don't reintroduce emoji as icon substitutes.

### Page structure (`index.html`, section order top to bottom)

`#inicio` (hero) → `#missao` → `#quem-somos` (tabbed: Missão/Visão/Valores/Órgãos Sociais/Documentos) → `#projetos` → `#crise` → `#noticias` → `#associar` → `#participar` → `#contactos`. Sections alternate `.section` / `.section section--alt` (cream/white) for visual rhythm — preserve the alternation if you reorder sections. Nav link order and section order are kept in sync intentionally.

### Forms are Netlify Forms, not a custom backend

`#inscricao-form` and `#contact-modal-form` use the `data-netlify="true"` + hidden `form-name` input convention and are submitted via `js/modules/forms.js` (`handleFormSubmit`), which POSTs URL-encoded data to `/`. **This only actually delivers anywhere when the site is deployed on Netlify.** On any other static host the POST silently fails and the success state still shows (the fetch failure is swallowed) — if you change hosting or need real delivery confirmation, this is the place to fix.

### `#noticias` is fed by a scheduled GitHub Action, not live at page-load

`scripts/fetch-noticias.mjs` is a **build-time** Node script (needs `npm install`, run via `npm run fetch:noticias`) that queries the Google News RSS feed for *several* Algarve-housing topics — not just the crisis — defined in the `QUERIES` array (currently: crise habitacional, habitação social, arrendamento acessível, construção habitação). It merges all results, drops exact link duplicates and near-duplicate titles (Jaccard similarity on normalized words, stripping "| Por Nome Apelido" bylines first so the same article republished with/without a byline still matches), sorts by date, and writes the top 10 to `data/noticias.json` (`{ atualizado_em, queries, noticias: [{titulo, link, fonte, data}] }`). If you add a query, test it standalone first (`curl` the feed URL) — "alojamento local Algarve" was tried and dropped because it returned mostly tourism content, not housing.

`.github/workflows/atualizar-noticias.yml` runs that script hourly (cron) and on manual dispatch, committing `data/noticias.json` back to `main` when it changes. **This means `git push` to `main` can be rejected by a bot commit made minutes earlier** — `git pull --rebase` before pushing; conflicts land in `data/noticias.json` and should normally be resolved by keeping your version (it reflects the current script/query set) rather than the bot's (generated with whatever script version was live an hour ago).

`js/modules/noticias.js` (`initNoticias`, called from `app.js`) `fetch()`es `data/noticias.json` client-side on page load and renders it into `#noticias-list`, reusing the `.news-feature__row` / `.noticia-card__*` / `.project-card__title` classes; it shows a discreet fallback message if the fetch fails or the file doesn't exist yet. It does not read the `queries` field — that's informational only.

### Observatory modal is static data, not the `estatistica/` backend

The "Observatório da Habitação" modal (`#obs-overlay`, driven by `js/modules/observatory.js`) renders entirely from the hardcoded dataset in `js/data/observatory-data.js` (16 Algarve municipalities, rent/sale/variation figures). The `estatistica/` folder (FastAPI backend + a standalone React `ObservatorioHabitacao.jsx`) is a **separate, unwired prototype** for a future live-data version — it is not imported or called by the static site. Don't assume the two are connected; updating one does not affect the other.

## Known placeholders / incomplete areas

- Footer legal links "Estatutos", "Relatórios de Atividade", "Livro de Reclamações" and the four social links are still `href="#"`.
- The "Documentos" tab in Quem Somos links to `estatutos.pdf` and `regulamento.pdf`, which don't exist in the repo yet (left as-is intentionally — real files pending).
- The three housing projects in `#projetos` (Clínica de Habitação, Observatório da Habitação, Algarve Cohabita) and `#quem-somos` (Órgãos Sociais) contain real-looking but placeholder content, not yet confirmed official copy.
- `#noticias` is live (see above) and pulls real third-party press coverage of housing in the Algarve generally, not ACIMHA's own news, and not the other three civic axes — there is currently no section for ACIMHA's own press releases/communicados.
