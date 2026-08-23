# Performance Audit — ACIMHA (Core Web Vitals)

**Fase 13 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Auditoria estática do código (imagens, CSS, JS,
caching) — **não inclui medições reais de Core Web Vitals**, porque isso exige o site em produção em
`acimha.pt` com DNS/SSL estabilizados. Segundo o registo mais recente no Notion do projeto, o domínio
estava "adicionado ao Netlify, a aguardar validação DNS" — a confirmar antes de correr Lighthouse/CrUX
reais.

---

## 1. Já coberto (Fase 3, commit `fda0522`)

- Imagens Hero, Missão e Visão convertidas para WebP.
- `netlify.toml` com cache agressivo (`max-age=31536000, immutable`) em `/assets/*`, 1 dia em `/css/*` e
  `/js/*`.
- Sem pipeline de build — HTML/CSS/JS servidos diretamente, sem latência de build nem dependências de
  runtime.
- `js/app.js` carregado com `type="module"` — deferido automaticamente pelo browser (comportamento nativo
  de `type="module"`, equivalente a `defer`).
- `missao.webp` e `visao.webp` já têm `loading="lazy"` (estão dentro de um separador/tab, não visíveis no
  primeiro ecrã).

---

## 2. Corrigido nesta fase

### `fetchpriority="high"` na foto ativa do hero

`Hero1.webp` é o candidato mais provável a LCP (Largest Contentful Paint) — é a imagem de fundo do hero,
visível imediatamente, o maior elemento de conteúdo do primeiro ecrã. Adicionado `fetchpriority="high"` para
sinalizar ao browser que deve priorizar este download face a outros recursos não críticos.

### `loading="lazy"` no logo do footer

`ACIMHA02.png` (144px, no footer) está sempre fora do primeiro ecrã (below the fold) — não tinha
`loading="lazy"`, agora tem.

---

## 3. Observado, não corrigido (precisa de mais contexto/teste antes de mexer)

### Carrossel do hero carrega as 3 fotos de imediato, sem forma simples de adiar

`Hero1/2/3.webp` estão todas `position: absolute; inset: 0` no mesmo contentor (`.hero__photo`,
`css/main.css:425`), com crossfade por `opacity` (`.hero__photo--active`). Isto significa que **as 3
imagens ocupam a mesma caixa de layout desde o primeiro render** — `loading="lazy"` não as adiaria mesmo
que fossem marcadas, porque a deteção de "fora do viewport" do browser é baseada na posição/tamanho da
caixa em layout, não na opacidade CSS. Hero2/Hero3 (89KB + 58KB) competem por largura de banda com o
elemento LCP real (Hero1).

**Não implementado nesta fase** porque a correção correta exige lógica JS (carregar `src` de Hero2/Hero3
só depois do primeiro carrossel rotacionar, ou via `IntersectionObserver`/atraso programado) — uma
alteração maior ao módulo do carrossel do hero, que devia ser validada com medição real de LCP antes/depois
para confirmar que ajuda em vez de introduzir instabilidade visual. Recomendação para uma fase técnica
dedicada, não para esta auditoria.

---

## 4. Higiene de repositório — imagens órfãs (~40 MB)

Encontrados ficheiros de imagem **sem nenhuma referência em HTML/CSS/JS**:

| Ficheiro(s) | Tamanho | Motivo |
|---|---|---|
| `Hero1.png`, `Hero2.png`, `Hero3.png` | ~6,2 MB | Originais PNG pré-conversão WebP (`fda0522` já os substituiu por `.webp`, mas não apagou os originais) |
| `missao.png`, `visao.png` | ~5,0 MB | Idem |
| `ACIMHA00.png` | 383 KB | Não referenciado; `ACIMHA.png`/`ACIMHA02.png` são as versões em uso |
| `Mapa_dos_municípios_do_Algarve.png` | 128 KB | Não referenciado em lado nenhum |
| `assets/images/logos_old/` (18 ficheiros) | ~27 MB | Já documentado no `CLAUDE.md` como "artwork antigo/experimental... não referenciado em lado nenhum" |

**Total: ~39 MB de imagens não usadas pelo browser** — não afeta o tempo de carregamento real do site
(não são pedidas por nenhuma página), mas infla o tamanho do repositório, o tempo de clone/checkout, e
aumenta o risco do tipo de "ficheiro órfão silenciosamente esquecido" que o `CLAUDE.md` já assinala como
problema recorrente neste projeto (aconteceu antes com CSS).

**Decisão (confirmada nesta sessão):** removidos os 7 PNGs pré-WebP substituídos (`Hero1/2/3.png`,
`missao.png`, `visao.png`, `ACIMHA00.png`, `Mapa_dos_municípios_do_Algarve.png` — ~11,9 MB), porque são
duplicados diretos de ficheiros já convertidos e em uso. **`assets/images/logos_old/` (~27 MB) foi mantida
deliberadamente** como arquivo de referência de design, por decisão explícita — não é considerada dead
weight no mesmo sentido, mesmo continuando sem estar ligada ao site.

---

## 5. Por medir (fora do âmbito desta sessão)

- **LCP, CLS, INP reais** — precisam do site em `acimha.pt` com DNS/SSL ativos (Lighthouse, PageSpeed
  Insights, ou CrUX depois de tráfego real).
- **Peso total de página e número de pedidos** — mensurável em qualquer ambiente (inclusive local via
  `python3 -m http.server`), mas mais útil já no domínio final por causa dos headers de cache do
  `netlify.toml`, que só se aplicam em produção Netlify.
