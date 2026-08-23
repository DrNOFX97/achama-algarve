# Auditoria Final — SEO + AEO + GEO + AIO (ACIMHA)

**Fase 14 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Fecha o roadmap: resume o que foi feito em cada
fase, o que ficou deliberadamente por fazer (e porquê), e o que precisa de ação humana para continuar.

---

## 1. Estado por fase

| Fase | Nome | Estado | Entregável(is) |
|---|---|---|---|
| 0 | Preparação e auditoria | ✅ Feita (antes deste roadmap, commit `fda0522`) | robots.txt, sitemap.xml, canonical, headers, WebP |
| 1 | Estratégia de palavras-chave | ✅ Feita | `keyword-map.md`, `search-intent-map.md` |
| 2 | Arquitetura de informação | ✅ Feita | `acimha-information-architecture.md` |
| 3 | Technical SEO | ✅ Feita | `technical-seo-implementation.md` + sitemap automático + OG em páginas legais |
| 4 | Schema.org (AEO+GEO) | ✅ Feita | `schema-strategy.md` + NGO/WebPage/BreadcrumbList no JSON-LD |
| 5 | AEO | ✅ Estratégia feita; FAQ visível **não implementada** (decisão tua) | `aeo-strategy.md` |
| 6 | GEO — modelo de entidade | ✅ Feita | `acimha-entity-model.md` |
| 7 | Website AI-readable | ✅ Feita | `ai-readable-web.md` + `/llms.txt` |
| 8 | Conteúdo (arquitetura escalável) | ✅ Feita | `content-strategy.md`, `content-clusters.md` |
| 9 | Comparações | ⏭️ Saltada a teu pedido — já avaliada como largamente não aplicável no próprio roadmap | — |
| 10 | Internal linking | ✅ Feita | `internal-linking-strategy.md` + 3 links novos |
| 11 | GEO externo (autoridade) | ✅ Auditada — nada real para citar ainda | `external-authority-strategy.md` |
| 12 | Benchmark de visibilidade AI | ✅ Metodologia feita; **execução real pendente** (precisa de ti) | `geo-benchmark.md`, `geo-benchmark.json` |
| 13 | Performance (Core Web Vitals) | ✅ Auditoria estática feita; **medição real pendente** (precisa do domínio ativo) | `performance-audit.md` |
| 14 | Auditoria final | ✅ Este documento | `final-seo-aeo-geo-aio-audit.md` |

---

## 2. O que mudou no site desde o início deste roadmap

- **Estatutos oficiais publicados** (`assets/docs/estatutos_ACIMHA.pdf`), 2 links placeholder corrigidos
- **Missão e Valores** (7 valores) atualizados com o texto institucional aprovado
- **JSON-LD**: `Organization` → `NGO`, dois `contactPoint` (geral/suporte), bloco `WebSite` próprio,
  `WebPage` nas 3 páginas, `BreadcrumbList` nas 2 páginas legais
- **Sitemap** com `lastmod` automático via GitHub Action
- **Open Graph/Twitter Cards** completos nas páginas legais (só tinham canonical/description)
- **`/llms.txt`** novo, alinhado com `robots.txt`/`sitemap.xml`
- **Internal linking**: cadeia Observatório ↔ Crise ↔ Projetos ↔ Associar-se agora bidirecional
- **Performance**: `fetchpriority` no hero, `lazy loading` no logo do footer, ~12 MB de PNGs órfãos
  removidos
- **14 documentos novos em `/docs/`** (ver tabela acima), cobrindo estratégia, arquitetura e auditoria

---

## 3. O que continua por fazer — e porquê não foi feito aqui

Nada disto foi implementado nesta sessão **porque cada item depende de informação, decisão ou acesso que
só tu tens** — não por esquecimento. Lista consolidada, com a fase onde cada um foi sinalizado:

| Item | Porque não avancei | Sinalizado em |
|---|---|---|
| Fontes das 3 estatísticas de "A Crise" (+180%, 68%, 12k) | Sem fonte verificável no repo/Notion — marcado UNKNOWN por regra do roadmap | `aeo-strategy.md` |
| FAQ visível no site + `FAQPage` schema | Decisão de conteúdo/design maior — banco de perguntas já pronto | `aeo-strategy.md` |
| Mecanismo real de submissão de Queixas de Bairro | Decisão de produto — publicar um guia sem processo real seria enganador | `search-intent-map.md`, `aeo-strategy.md`, `content-clusters.md` |
| Comunicados/notícias próprias da ACIMHA | Sem processo definido (quem escreve, cadência, aprovação) — UNKNOWN | `content-strategy.md` |
| Órgãos Sociais confirmados | Nomes atuais são placeholder, não confirmados institucionalmente | Já sinalizado no `CLAUDE.md`, repetido em todas as fases relevantes |
| Detalhes dos 3 projetos de habitação (Clínica, Observatório, Cohabita) | Conteúdo "com aparência real mas não confirmado" | Idem |
| `regulamento.pdf` | Ficheiro não fornecido (ao contrário dos estatutos, que já foram) | — |
| Redes sociais reais (footer/`#contactos`) | Ainda `href="#"` — sem perfis para ligar | `acimha-entity-model.md`, `external-authority-strategy.md` |
| `sameAs` no JSON-LD | Depende do item anterior | `acimha-entity-model.md` |
| Favicon | Sinalizado desde a Fase 0, nunca endereçado neste roadmap (não é Technical SEO estrito) | `technical-seo-implementation.md` |
| Execução real do benchmark GEO (Fase 12) | Preciso de acesso a ChatGPT/Gemini/Perplexity, que não tenho aqui | `geo-benchmark.md` |
| Core Web Vitals reais (Fase 13) | Precisa do domínio `acimha.pt` com DNS/SSL ativos | `performance-audit.md` |
| Carrossel do hero carrega 3 imagens de imediato | Correção exige mudança de lógica JS + validação com medição real de LCP | `performance-audit.md` |

---

## 4. Lista de ação sugerida (por quem)

**Só tu podes decidir/fazer:**
1. Confirmar fonte (ou marcar como estimativa) das estatísticas de "A Crise"
2. Confirmar nomes dos Órgãos Sociais e validar o texto dos 3 projetos de habitação
3. Decidir o mecanismo real de Queixas de Bairro
4. Decidir se/quando a ACIMHA vai publicar comunicados próprios
5. Confirmar DNS/SSL de `acimha.pt` em produção (bloqueia Fase 12 e 13 na prática)
6. Criar/ligar perfis reais de redes sociais
7. Fornecer `regulamento.pdf` e um favicon
8. Correr o benchmark GEO manualmente (`geo-benchmark.md`) nos assistentes de IA que quiseres testar

**Posso fazer numa próxima sessão, assim que tiveres o acima:**
- Implementar FAQ + `FAQPage` schema (banco de perguntas já pronto)
- Adicionar `sameAs` ao JSON-LD assim que houver redes sociais reais
- Escrever o guia de Queixas de Bairro, assim que o mecanismo existir
- Medir e otimizar Core Web Vitals reais assim que o domínio estiver ativo
- Repetir o benchmark GEO passado uns meses para comparar evolução

---

## 5. Índice de documentos produzidos

Todos em `/docs/`: `keyword-map.md`, `search-intent-map.md`, `acimha-information-architecture.md`,
`technical-seo-implementation.md`, `schema-strategy.md`, `aeo-strategy.md`, `acimha-entity-model.md`,
`ai-readable-web.md`, `content-strategy.md`, `content-clusters.md`, `internal-linking-strategy.md`,
`external-authority-strategy.md`, `geo-benchmark.md` + `geo-benchmark.json`, `performance-audit.md`, e
este ficheiro.
