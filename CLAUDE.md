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

`js/app.js` is loaded as `type="module"` and imports each feature from `js/modules/` (`ui-utils.js`, `forms.js`, `tabs.js`, `observatory.js`, `inscricao-modal.js`, `contact-modal.js`, `queixa-modal.js`, `noticias.js`) plus the static dataset `js/data/observatory-data.js`. Every feature is wrapped in a `safe(() => ...)` try/catch in `app.js` so one module throwing doesn't break the rest of the page.

### Design system: Monocle Magazine editorial style

The site was overhauled to an editorial-magazine visual language (cream/ink/red palette, serif type, hairline rules, numbered feature lists) — see the CSS custom properties at the top of `css/main.css`:

- `--color-bg` (cream `#F2EFE7`), `--color-primary` (ink, doubles as body text), `--color-accent` (editorial red), `--color-olive`, `--color-hairline`
- `--font-heading` (Playfair Display), `--font-body` (Source Serif 4, for body copy), `--font-sans` (Source Sans 3, **only** for small uppercase kickers/labels — not body text)
- `--radius*` are all `0` and `--shadow-*` are all `none` site-wide — the design language has no rounded corners, no drop shadows, and (outside the Observatory's semantic data colors) no decorative gradients. Match this when adding UI rather than reintroducing card/shadow/gradient patterns.
- Repeated content blocks (crisis stats, projects, news, ways to participate) use the shared `.stats-feature` / `.stats-feature__row` numbered-row pattern instead of card grids — reuse it for new list-like content instead of building a new card component.
- Decorative emoji icons were removed in favor of serif numerals or small square accent marks; don't reintroduce emoji as icon substitutes.

### Page structure (`index.html`, section order top to bottom)

`#inicio` (hero) → `#missao` → `#quem-somos` (tabbed: Missão/Visão/Valores — Órgãos Sociais and Documentos exist as HTML comments in the same tab list, hidden since 2026-08-30 pending real content from the client, see Known placeholders below) → `#projetos` → `#crise` → `#noticias` → `#associar` → `#participar` → `#contactos`. Sections alternate `.section` / `.section section--alt` (cream/white) for visual rhythm — preserve the alternation if you reorder sections. Nav link order and section order are kept in sync intentionally.

### Forms are Netlify Forms, not a custom backend

`#inscricao-form` and `#contact-modal-form` use the `data-netlify="true"` + hidden `form-name` input convention and are submitted via `js/modules/forms.js` (`handleFormSubmit`), which POSTs URL-encoded data to `/`. **This only actually delivers anywhere when the site is deployed on Netlify.** On any other static host the POST silently fails and the success state still shows (the fetch failure is swallowed) — if you change hosting or need real delivery confirmation, this is the place to fix.

`handleFormSubmit`'s success callback re-derives its `fields`/`success` elements from the `<form>`'s own DOM structure at submit time (`fields = fieldsEl || formEl.parentElement`, `success = fields.nextElementSibling`) instead of only trusting the elements captured once when the page's modules initialized. This exists because of a real, still not fully root-caused production incident: on `acimha.pt` (never reproduced on a deploy preview with identical code), those captured references were sometimes `null` at submit time even though the elements existed in the final DOM, silently breaking the success screen and, for the ficha de inscrição, the email send — caught by the `fetch(...).catch()` with no visible error. See "JS asset caching" below for the most likely explanation.

### JS asset caching — a real, recurring production risk

`css/*` and `js/*` are served with `Cache-Control: public, max-age=86400` (`netlify.toml`), but `index.html` (and other HTML entry points) is `max-age=0, must-revalidate`. A deploy that changes both an HTML file and a JS module it loads (e.g. adding a field to a form, or changing a function's signature) can leave a browser that already cached the old JS running **mismatched HTML + JS for up to 24h** after the new HTML is live — this is the leading suspect for the `forms.js` incident above. When debugging "works on deploy preview / fresh browser, fails intermittently on `acimha.pt`", hard-reload (`Ctrl+Shift+R`) before concluding it's a code bug — a plain reload or `fetch(url, {cache:'no-store'})` from the console can still read a fresh copy while the page's own `<script type="module">` import used the stale cached one.

### Ficha de Inscrição — geração do `.docx`/PDF e envio por email

`js/modules/inscricao-docx.js` builds the "Proposta / Ficha de Inscrição" in two formats, both loaded from a CDN only on demand (not bundled): the `docx` library for the **local download** (`buildDocument`, `gerarFichaDocx`, `baixarFichaDocx`), and `pdfmake` for the **email attachment** (`buildPdfDocDefinition`, `gerarFichaPdf`) — the email must carry a ready-to-sign PDF (Chave Móvel Digital only accepts PDF uploads), not a `.docx`. There is no reliable docx→pdf conversion available inside a Netlify Function (no LibreOffice/Word engine in that serverless environment), so the PDF is built independently from the same plain data object rather than converted from the generated `.docx` — the two renderers duplicate layout code (docx and pdfmake have unrelated document APIs) but share all the data-prep helpers (`getFieldValue`, `formatLocalidade`, `normalizarNomeFicheiro`, `fetchLogoBytes`, etc.). Both renderers' font sizes/margins are tuned to fit the whole ficha on a single A4 page — verified against real and pathologically long field values; there is no dynamic shrink-to-fit, so an unrealistically long input (fields have no `maxlength`) could in theory still spill to a second page, same latent risk the `.docx` already had.

Both entry points (`gerarFichaDocx`/`baixarFichaDocx`, `gerarFichaPdf`) take a **plain data object** (`{ nome, nif, aceita_estatutos, ... }` — the same field names as the form's `name` attributes / `list-inscricoes.mjs`'s output), not a live `<form>` element. This is deliberate: it lets the exact same document-building code run from `inscricao-modal.js` (via `formDataParaDados(formEl)`, converting the live public form) and from `admin/admin.js` (using an inscrição's already-stored data, no form present) — the admin's "Enviar documento para assinar" button (below) depends on this and only ever needs the PDF (`gerarFichaPdf`), never the local `.docx` download. `LOGO_PATH` must stay an absolute `/assets/...` path — a relative one silently 404s when this module is imported from `/admin/`.

`netlify/functions/send-inscricao-docx.mjs` emails that generated PDF (as base64, field `pdfBase64`) via SMTP/nodemailer — `SMTP_HOST`/`PORT`/`USER`/`FROM`/`PASS` env vars, live and confirmed working (not a stub). It's called both right after a public submission (`inscricao-modal.js`) and from the admin resend button, and validates the caller-supplied token against `inscricao-tokens` (Blobs) before sending — see `create-inscricao-token.mjs` below for how that token is minted in each case. The function's filename/route were kept as-is (`send-inscricao-docx`) even though it now sends a PDF, to avoid an unnecessary rename across both call sites.

### Queixa de Bairro (`js/modules/queixa-modal.js`) — dedicated form, not the generic contact form

The FAQ used to tell people to use the generic contact form for neighbourhood complaints, but that form's
`assunto` dropdown had no matching category — a real product gap (`docs/search-intent-map.md` flagged it as
the site's biggest intent/offer mismatch). `#missao` pillar 02 now has a "Reportar um problema" CTA that
opens a dedicated modal (`#queixa-overlay`), submitting a separate Netlify Form (`queixa-bairro`: nome,
email, telefone, concelho, local, tipo de problema, descrição, foto opcional, autorização RGPD). It reuses
`contact-modal.css`/`forms.css`/`inscricao.css` classes verbatim — no new stylesheet.

Unlike the other three forms, this one does **not** use `handleFormSubmit` from `forms.js` — that helper
always serializes as `application/x-www-form-urlencoded`, which drops file content. `queixa-modal.js` has
its own submit handler, `fetch('/', { body: new FormData(formEl) })` with no forced `Content-Type` (same
pattern as `inscricao-signature.js`'s PDF upload), so the optional photo travels in the same multipart
submission as the text fields — one request, not the two-phase flow the inscrição/assinatura process needs.

`/admin` has a "Queixas de Bairro" panel mirroring the inscrições one: `netlify/functions/list-queixas.mjs`
/ `update-queixa-estado.mjs` / `delete-queixa.mjs` / `get-queixa-foto.mjs`, backed by its own Blobs store
(`queixas-admin`, `getQueixasStore()` in `lib/blobs.mjs`). States are `Pendente` (default) → `Encaminhada` /
`Resolvida`, plus `Apagado` (soft-delete, same reversible pattern as inscrições — `delete-queixa.mjs` never
called the Netlify Forms delete API, unlike `delete-inscricao.mjs`'s original definitivo version).

**Found while building this:** `.contact-modal__success` in `contact-modal.css` declared `display: flex`
unconditionally, with no guard. Because that stylesheet loads after `forms.css` in `<head>`, it beat
`.form__success`'s `display: none` at equal specificity — the success panel was visible by default on the
**already-live contact modal**, not just after submitting. Fixed by dropping the unguarded `display` from
the base rule so `.form__success`'s `display: none` applies until `.is-visible` is added. Any new modal
built on this `contact-modal__*`/`form__*` pattern should double-check its success panel is actually hidden
on open, not just assume it — the two stylesheets' load order makes this easy to get wrong again.

### FAQ (`#faq`) — only answers already backed by published copy, nothing invented

14 questions as `<details>` elements plus a matching `FAQPage` JSON-LD block (`#faq-1` through `#faq-14`,
ids and order must stay in sync between the two). The rule for adding a question here, established in
`docs/aeo-strategy.md` §1 and followed since: **every answer must be traceable to text already published
elsewhere on the site** — extracted/summarized, never a new claim. Where a real answer doesn't exist yet
(e.g. Queixas de Bairro before the dedicated form existed), the strategy doc's instruction is to mark it as
a content gap and not fabricate a plausible-sounding one. 7 questions shipped 25/08; 7 more (Algarve
Cohabita, Tertúlias, autarquias, quota, benefícios de sócio, contacto, valores) added 30/08 straight from
the pre-vetted, source-cited bank in `aeo-strategy.md` once given the go-ahead — that doc already has the
next candidates if more are added later.

### `#noticias` is fed by a scheduled GitHub Action, not live at page-load

`scripts/fetch-noticias.mjs` is a **build-time** Node script (needs `npm install`, run via `npm run fetch:noticias`) that queries the Google News RSS feed for *several* Algarve-housing topics — not just the crisis — defined in the `QUERIES` array (currently: crise habitacional, habitação social, arrendamento acessível, construção habitação). It merges all results, drops exact link duplicates and near-duplicate titles (Jaccard similarity on normalized words, stripping "| Por Nome Apelido" bylines first so the same article republished with/without a byline still matches), sorts by date, and writes the top 10 to `data/noticias.json` (`{ atualizado_em, queries, noticias: [{titulo, link, fonte, data}] }`). If you add a query, test it standalone first (`curl` the feed URL) — "alojamento local Algarve" was tried and dropped because it returned mostly tourism content, not housing.

`.github/workflows/atualizar-noticias.yml` runs that script hourly (cron) and on manual dispatch, committing `data/noticias.json` back to `main` when it changes. **This means `git push` to `main` can be rejected by a bot commit made minutes earlier** — `git pull --rebase` before pushing; conflicts land in `data/noticias.json` and should normally be resolved by keeping your version (it reflects the current script/query set) rather than the bot's (generated with whatever script version was live an hour ago).

`js/modules/noticias.js` (`initNoticias`, called from `app.js`) `fetch()`es `data/noticias.json` client-side on page load and renders it into `#noticias-list`, reusing the `.news-feature__row` / `.noticia-card__*` / `.project-card__title` classes; it shows a discreet fallback message if the fetch fails or the file doesn't exist yet. It does not read the `queries` field — that's informational only.

### Observatory modal is static data, not the `estatistica/` backend

The "Observatório da Habitação" modal (`#obs-overlay`, driven by `js/modules/observatory.js`) renders entirely from the hardcoded dataset in `js/data/observatory-data.js` (16 Algarve municipalities, rent/sale/variation figures). The `estatistica/` folder (FastAPI backend + a standalone React `ObservatorioHabitacao.jsx`) is a **separate, unwired prototype** for a future live-data version — it is not imported or called by the static site. Don't assume the two are connected; updating one does not affect the other.

### Admin panel (`/admin`) — separate Netlify Functions backend, not part of the public site

`/admin` (standalone `admin/index.html` + `admin/admin.js`, no link from the public site, `noindex` + `Disallow: /admin/` in `robots.txt`) is a private dashboard for managing inscrições and institutional documents. Login is Google OAuth restricted to a single allowlisted email (`ALLOWED_ADMIN_EMAIL`), via `netlify/functions/auth-google-start.mjs` / `auth-google-callback.mjs` / `auth-check.mjs` / `auth-logout.mjs`, with a signed HMAC session cookie (`netlify/functions/lib/session.mjs`).

Backend functions (`netlify/functions/*.mjs`) read/write the real Netlify Forms submissions (`inscricao`, `inscricao-assinatura`) and use Netlify Blobs stores (`netlify/functions/lib/blobs.mjs`) for state Netlify Forms itself can't express:
- `inscricoes-admin` — per-submission override, two independent shapes merged on top of the raw submission by `list-inscricoes.mjs`: `estado: 'Aprovado' | 'Apagado'` (set by `update-inscricao-estado.mjs` / `delete-inscricao.mjs`) and `dados: {...}` (arbitrary corrected fields, set by `update-inscricao-dados.mjs`, backing the admin "Ver detalhes/Editar" modal). Deleting an inscrição never calls the real Netlify Forms delete API — it only writes the `estado` override, so it's a reversible soft-delete (`list-inscricoes.mjs` hides `'Apagado'` items by default; `?apagados=1` lists them for the panel's "Ver apagadas" / "Restaurar" flow). Both `update-inscricao-estado.mjs` and `delete-inscricao.mjs` read-then-merge before writing specifically so that changing `estado` never clobbers a previously-saved `dados` correction (a real regression, since fixed).
- `inscricao-tokens` — "resume signature" links (`create-inscricao-token.mjs` / `resolve-inscricao-token.mjs`, 30-day TTL), consumed by the public `assinatura.html` page and by the "Copiar link de assinatura" / "Enviar documento para assinar" admin actions (below).
- `rate-limits` — fixed-window per-IP throttling (`netlify/functions/lib/rate-limit.mjs`, fail-open if Blobs are unavailable), used by `check-nif-duplicado.mjs` since that's the only endpoint callable by the public with no session gate.

`create-inscricao-token.mjs` has two call shapes with different trust levels: `{email, nome}` (public, used right after a real submission — the caller *is* the applicant) needs no session; `{submissionId}` (admin panel, since a submission ID isn't secret — it's visible in PDF URLs) requires a valid admin session. In the `submissionId` path it prefers an `inscricoes-admin` `dados.email`/`dados.nome` override over the raw Netlify Forms submission when one exists — otherwise correcting a wrong email via "Ver detalhes" and then resending would mint a token for the *old* email, which `send-inscricao-docx.mjs` would then reject as mismatched (a real bug, since fixed).

For each inscrição still missing a signed PDF (`!pdfUrl`), the admin table offers two related but distinct actions: **"Copiar link de assinatura"** (mints a token, copies the resume URL to the clipboard, sends nothing) and **"Enviar documento para assinar"** (mints a token, regenerates the `.docx` from the inscrição's stored data, and actually emails it via `send-inscricao-docx.mjs` — for when the applicant never got the original email, or an old inscrição predates SMTP being configured).

Netlify Forms email notifications (`submission_created` → `geral@acimha.pt`, one hook per form: `inscricao`, `contacto`, `queixa-bairro`) are configured as **Netlify hooks via the API**, not in this repo — `netlify api` / the site's Forms dashboard is the only place to see or change them; grepping the codebase won't find them.

`upload-document.mjs` never commits directly to `main` — it creates a branch + PR via the GitHub API for manual review/merge.

**Project rule for this subsystem**: no task advances without confirming the previous one first (real personal data of associados is involved), and nothing that touches inscrição/associado data or its access logic gets committed straight to `main` — always branch + PR, including for Claude Code sessions working autonomously/unsupervised.

## Known placeholders / incomplete areas

- "Relatórios de Atividade" has no destination and was removed from the footer entirely (not linked anywhere). Of the four original social placeholders, only Facebook has a real page and is linked (in `#contactos`); Instagram/Twitter-X/LinkedIn were removed rather than left as `href="#"`. "Livro de Reclamações" links to the real external site.
- The "Órgãos Sociais" and "Documentos" tabs in Quem Somos are hidden (commented out in `index.html`, both the tab buttons and their panels) since 2026-08-30 — Órgãos Sociais had fabricated placeholder names, and the linked Estatutos PDF (`assets/docs/estatutos_ACIMHA.pdf`, which does exist in the repo) is still going through legal validation with the client. Reactivate by uncommenting once the client confirms real content; don't invent replacement names in the meantime. The footer's own "Estatutos" legal link (same PDF) was hidden the same way on 2026-08-30 for the same reason — reactivate both together.
- The three housing projects in `#projetos` (Clínica de Habitação, Observatório da Habitação, Algarve Cohabita) contain real-looking but placeholder content, not yet confirmed official copy.
- `#noticias` is live (see above) and pulls real third-party press coverage of housing in the Algarve generally, not ACIMHA's own news, and not the other three civic axes — there is currently no section for ACIMHA's own press releases/communicados.
