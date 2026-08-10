# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**ACIMHA** (Associação Cívica de Munícipes e Habitação do Algarve) is a Portuguese civic association website advocating for housing rights in the Algarve. It is a **static multi-page site** — no build process, no package manager, no bundler, no backend. `index.html` is the main single-page site; `politica-privacidade.html` and `termos-condicoes.html` are separate standalone legal pages that share the same stylesheet.

## Running Locally

```bash
python3 -m http.server 8000
# Visit http://localhost:8000
```

Or open `index.html` directly in a browser. No compilation or installation required. There is no lint or test command — verify changes by loading the page and exercising the interactive elements (nav, modals, tabs, forms, Observatory).

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
- Repeated content blocks (crash stats, projects, news, ways to participate) use the shared `.stats-feature` / `.stats-feature__row` numbered-row pattern instead of card grids — reuse it for new list-like content instead of building a new card component.
- Decorative emoji icons were removed in favor of serif numerals or small square accent marks; don't reintroduce emoji as icon substitutes.

### Page structure (`index.html`, section order top to bottom)

`#inicio` (hero) → `#missao` → `#crise` → `#projetos` → `#quem-somos` (tabbed: Missão/Visão/Valores/Órgãos Sociais/Documentos) → `#noticias` → `#associar` → `#participar` → `#contactos`. Sections alternate `.section` / `.section section--alt` (cream/white) for visual rhythm — preserve the alternation if you reorder sections. Nav link order and section order are kept in sync intentionally.

### Forms are Netlify Forms, not a custom backend

`#inscricao-form` and `#contact-modal-form` use the `data-netlify="true"` + hidden `form-name` input convention and are submitted via `js/modules/forms.js` (`handleFormSubmit`), which POSTs URL-encoded data to `/`. **This only actually delivers anywhere when the site is deployed on Netlify.** On any other static host the POST silently fails and the success state still shows (the fetch failure is swallowed) — if you change hosting or need real delivery confirmation, this is the place to fix.

### Observatory modal is static data, not the `estatistica/` backend

The "Observatório da Habitação" modal (`#obs-overlay`, driven by `js/modules/observatory.js`) renders entirely from the hardcoded dataset in `js/data/observatory-data.js` (16 Algarve municipalities, rent/sale/variation figures). The `estatistica/` folder (FastAPI backend + a standalone React `ObservatorioHabitacao.jsx`) is a **separate, unwired prototype** for a future live-data version — it is not imported or called by the static site. Don't assume the two are connected; updating one does not affect the other.

## Known placeholders / incomplete areas

- Footer legal links "Estatutos", "Relatórios de Atividade", "Livro de Reclamações" and the four social links are still `href="#"`.
- The "Documentos" tab in Quem Somos links to `estatutos.pdf` and `regulamento.pdf`, which don't exist in the repo yet (left as-is intentionally — real files pending).
- `#projetos`, `#noticias`, `#quem-somos` (Órgãos Sociais) contain real-looking but placeholder content, not yet confirmed official copy.
