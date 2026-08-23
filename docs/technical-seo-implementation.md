# Technical SEO — Implementação

**Fase 3 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Documenta, ficheiro a ficheiro, o que já está
implementado no site estático `acimha.pt` — a maior parte no commit `fda0522` (pré-lançamento), o resto
nesta fase. Não cobre Schema.org em detalhe (isso é a Fase 4 — `schema-strategy.md`, ainda por criar).

---

## 1. `robots.txt`

Criado em `fda0522`. Permite indexação geral e bloqueia o protótipo não ligado ao site:

```
User-agent: *
Allow: /
Disallow: /estatistica/

Sitemap: https://acimha.pt/sitemap.xml
```

`/estatistica/` é o backend FastAPI + protótipo React do Observatório (ver `CLAUDE.md`) — não está ligado
ao site principal e não deve ser indexado.

---

## 2. `sitemap.xml`

Criado em `fda0522` com 3 URLs (`/`, `/politica-privacidade.html`, `/termos-condicoes.html`) e `lastmod`
fixo em `2026-08-21` — desatualizava a cada alteração de conteúdo.

**Resolvido nesta fase:** `lastmod` passa a ser automático.

- `scripts/update-sitemap-lastmod.mjs` — script Node sem dependências externas. Para cada `<url>` do
  sitemap, mapeia o `<loc>` para o ficheiro local correspondente e usa `git log -1 --format=%cd
  --date=short -- <file>` para obter a data do último commit que alterou esse ficheiro, atualizando o
  `<lastmod>`.
- `.github/workflows/atualizar-sitemap.yml` — corre o script automaticamente em cada `push` para `main`
  que altere `index.html`, `politica-privacidade.html` ou `termos-condicoes.html`, e faz commit do
  `sitemap.xml` atualizado se houver alterações. Usa `fetch-depth: 0` no checkout (histórico completo,
  necessário para o `git log` funcionar corretamente). Segue o mesmo padrão do workflow já existente
  `atualizar-noticias.yml`.
- `npm run update:sitemap` — para correr manualmente/localmente.

Novas páginas devem ser acrescentadas manualmente ao `sitemap.xml` (URL + `changefreq` + `priority`); o
`lastmod` dessa entrada passa a ser mantido automaticamente a partir do primeiro push.

---

## 3. URLs canónicas

`<link rel="canonical">` presente nas 3 páginas do site desde `fda0522`:

- `index.html` → `https://acimha.pt/`
- `politica-privacidade.html` → `https://acimha.pt/politica-privacidade.html`
- `termos-condicoes.html` → `https://acimha.pt/termos-condicoes.html`

---

## 4. Open Graph e Twitter Cards

`index.html` já tinha OG + Twitter Card completos desde `fda0522` (`og:title`, `og:description`,
`og:type`, `og:url`, `og:image`, `og:locale`, `twitter:card`, `twitter:title`, `twitter:description`,
`twitter:image`).

**Resolvido nesta fase:** as duas páginas legais não tinham nenhuma tag Open Graph/Twitter — só
`meta description` e `canonical`. Adicionado o mesmo conjunto de tags a `politica-privacidade.html` e
`termos-condicoes.html`, reutilizando `assets/images/ACIMHA.png` como imagem (mesma usada na homepage) e
`twitter:card` do tipo `summary` (em vez de `summary_large_image` da homepage — são páginas de texto, não
conteúdo visual).

---

## 5. Dados estruturados (JSON-LD) — nota, detalhe é Fase 4

`index.html` tem dois blocos `<script type="application/ld+json">` no `<head>`:

- `Organization` — com dois `contactPoint` (geral e suporte), morada e NIPC.
- `WebSite` — bloco separado, com `name`, `url` e `inLanguage`.

Atualizados nesta sessão (fora do âmbito desta fase, feito na tarefa de integração de conteúdo
institucional). As páginas legais não têm JSON-LD próprio — a avaliar na Fase 4 se compensa.

---

## 6. Cabeçalhos de segurança (`netlify.toml`)

Criado em `fda0522`. Aplica-se a todo o site (`/*`):

- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy`: restringe a `'self'`, Google Fonts (`style-src`/`font-src`) e permite
  `'unsafe-inline'` em `style-src`/`script-src` (necessário pelos `onmouseover`/`onmouseout` inline nos
  links de Documentos e pelos `<script type="application/ld+json">`)

Cache agressivo (`Cache-Control: public, max-age=31536000, immutable`) em `/assets/*`; cache de 1 dia em
`/css/*` e `/js/*`.

Também define os redirecionamentos HTTP→HTTPS e `www`→apex (301, forçados), garantindo que só existe uma
URL canónica servida (`https://acimha.pt/...`), consistente com o `rel="canonical"` de cada página.

---

## 7. Imagens (WebP + compressão)

Em `fda0522`:
- `Hero1.webp`, `Hero2.webp`, `Hero3.webp`, `missao.webp`, `visao.webp` — novas imagens em WebP.
- `ACIMHA.png` (809 KB → 52 KB) e `ACIMHA02.png` (347 KB → 76 KB) — comprimidas, mantidas em PNG (usadas
  como logo/favicon-like assets, onde WebP traria pouco ganho adicional face à necessidade de
  transparência consistente).

---

## Pendente (fora do âmbito desta fase, sinalizado para fases seguintes)

- **Favicon em falta** (já assinalado na Fase 0/auditoria) — não é Technical SEO estrito, mas afeta
  Rich Results/SERP branding. Não resolvido aqui.
- **Schema.org por secção** (Fase 4) — `Dataset` para o Observatório, `ItemList` para os pilares da
  Missão, `Article`/`NewsArticle` se/quando existirem comunicados próprios.
- **JSON-LD nas páginas legais** — a avaliar em Fase 4.
- Meta description das páginas legais já existia antes desta fase (não estava em falta, ao contrário do
  que o roadmap original assumia) — só faltava Open Graph, agora resolvido.
