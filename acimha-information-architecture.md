# Arquitetura de Informação — ACIMHA

Fase 2 do [Roadmap SEO + AEO + GEO + AIO (ACIMHA)](https://app.notion.com/p/3c4a99e6526b81fbaaabfbabf9a18523). Construído a partir da estrutura real do `index.html` (não da suposição inicial do keyword map — corrigido aqui: não existe âncora própria `#observatorio`, é um modal `#obs-overlay` acedido a partir de `#projetos`; existe também `#participar`, que faltava mapear).

> **Página única (`acimha.pt/`):** o site é uma landing page de secção única com âncoras internas, mais 2 páginas legais autónomas (política de privacidade, termos e condições). Toda a arquitetura abaixo refere-se a âncoras dentro da mesma URL, exceto onde indicado.

---

## Nível de página (global)

| Campo | Valor atual |
|---|---|
| URL | `https://acimha.pt/` |
| Title | `ACIMHA – Associação Cívica do Algarve` |
| Meta description | "ACIMHA – Associação Cívica de Munícipes e Habitação do Algarve. Tertúlias, queixas de bairro, participação cívica e habitação a custo reduzido — a nossa frente mais desenvolvida." |
| Canonical | `https://acimha.pt/` ✅ |
| Idioma | `pt` (html lang) — considerar `pt-PT` mais específico |
| Schema | `Organization` + `WebSite` (JSON-LD, Fase 4) |

---

## `#inicio` — Hero

- **H1:** (hero__title, texto institucional de abertura)
- **Intenção:** Navigational / primeiro impacto — não é alvo de pesquisa direta, é a porta de entrada
- **Keywords:** ACIMHA, associação cívica Algarve (cluster 4)
- **Público-alvo:** todos os visitantes (primeira dobra)
- **Propósito:** apresentar a associação em 1 frase + CTA para a Missão
- **Internal links:** → `#missao` ("Conhecer a missão")
- **Schema:** herda `Organization` da página
- **CTA:** "Conhecer a missão"

## `#missao` — A nossa missão

- **H2:** "A nossa missão" (id: `missao-title`)
- **Intenção:** Informational (cluster 2 — cidadania e participação) + Navigational (nome da associação)
- **Keywords:** missão ACIMHA, associação cívica Algarve, cidadania ativa, participação cívica
- **Público-alvo:** munícipes que querem perceber "o que é a ACIMHA"
- **Propósito:** apresentar a missão institucional aprovada + os 4 eixos de atuação (tertúlias, queixas de bairro, participação cívica, habitação a custo reduzido)
- **Internal links (entrada):** hero, nav principal, footer ("Missão e Visão")
- **Internal links (saída):** nenhum explícito atualmente — **oportunidade:** ligar cada um dos 4 pilares às secções correspondentes (`#participar` para tertúlias/queixas, `#projetos` para habitação)
- **Schema:** candidato a `AboutPage` ou mantido dentro de `Organization.description`
- **CTA:** implícito (nenhum botão direto nesta secção)

## `#crise` — A crise habitacional no Algarve

- **H2:** "A crise habitacional no Algarve" (id: `crise-title`)
- **Intenção:** Informational (cluster 1 — habitação, maior volume potencial)
- **Keywords:** crise habitacional Algarve, rendas Algarve, direito à habitação
- **Público-alvo:** residentes afetados, jornalistas, investigadores, munícipes preocupados com o tema
- **Propósito:** dados/contexto sobre a crise habitacional regional
- **Internal links (entrada):** nav principal
- **Internal links (saída):** **UNKNOWN** — verificar se liga a `#projetos` ou ao Observatório (`#obs-overlay`); seria natural ligar
- **Schema:** candidato a dados estruturados de `Dataset` ou `Article` se as estatísticas tiverem fonte citável — **confirmar fontes dos números antes** (já sinalizado na auditoria/Fase 5)
- **CTA:** nenhum atual — **oportunidade:** CTA para `#associar` ou `#participar`

## `#projetos` — Os nossos eixos de atuação

- **H2:** "Os nossos eixos de atuação" (id: `projetos-title`)
- **Intenção:** Informational + Transactional (leva a `#associar`)
- **Keywords:** Clínica de Habitação, Observatório da Habitação, Algarve Cohabita, habitação a custo reduzido
- **Público-alvo:** munícipes interessados em soluções concretas, potenciais associados
- **Propósito:** apresentar os 3 projetos de habitação (cluster 1)
- **Internal links (saída):** 2 cards → `#associar` ("Saber mais"); 1 card → `#obs-overlay` (modal do Observatório, "16 Concelhos do Algarve")
- **Schema:** candidato a `Project`/`Service` (schema.org não tem tipo ideal para "projeto cívico" — avaliar `Organization.hasOfferCatalog` ou manter apenas em `Article`/texto)
- **CTA:** "Saber mais →" (x3)
- **⚠️ Conteúdo placeholder:** confirmado pela auditoria como não validado oficialmente — não otimizar agressivamente para SEO até ser aprovado, para não ter de reescrever depois

## `#quem-somos` — Quem somos

- **H2:** "Quem somos" (id: `quem-somos-title`)
- **Intenção:** Informational + Navigational (branded)
- **Keywords:** ACIMHA, órgãos sociais ACIMHA, associação cívica munícipes habitação Algarve (cluster 4)
- **Público-alvo:** quem quer verificar credibilidade/legitimidade institucional antes de se associar
- **Propósito:** tabs com Missão/Valores (texto institucional aprovado, Fase 1 já sincronizado) + Órgãos Sociais + Documentos
- **Internal links (entrada):** nav, footer
- **Internal links (saída):** separador "Documentos" → `estatutos.pdf`, `regulamento.pdf` (**404 — bloqueador conhecido**)
- **Schema:** `Organization` (contactPoint, taxID já cobertos na Fase 4); avaliar `founder`/`member` quando Órgãos Sociais forem confirmados
- **CTA:** nenhum direto — **oportunidade:** CTA para `#associar`
- **⚠️ Conteúdo placeholder:** Órgãos Sociais não confirmados oficialmente (mesmo bloqueador que Projetos)

## `#noticias` — Notícias e comunicados

- **H2:** "Notícias e comunicados" (id: `noticias-title`)
- **Intenção:** Informational, atualização recorrente (bom para "freshness" de SEO)
- **Keywords:** crise habitacional Algarve (via agregador RSS), notícias ACIMHA
- **Público-alvo:** visitantes recorrentes, imprensa
- **Propósito:** agrega notícias de imprensa sobre "crise habitacional Algarve" via RSS (não é conteúdo próprio da ACIMHA — distinção já documentada no projeto)
- **Internal links:** nenhum interno relevante (links externos para as fontes de notícia)
- **Schema:** `Article`/`NewsArticle` **não deve ser aplicado** a estas notícias — não são autoria da ACIMHA; risco de schema enganoso. Se no futuro houver comunicados próprios, esses sim devem ter `Article`/`PressRelease` dedicado, claramente separado desta secção agregadora
- **CTA:** nenhum

## `#associar` — Torne-se membro da ACIMHA

- **H2:** "Torne-se membro da ACIMHA" (id: `associar-title`)
- **Intenção:** Transactional (cluster 4, o mais importante de conversão)
- **Keywords:** como associar-me ACIMHA, tornar-me membro
- **Público-alvo:** visitantes já convencidos, prontos a agir
- **Propósito:** formulário de inscrição de associado
- **Internal links (entrada):** hero indireto, `#projetos` (x2), `#participar` ("Contribuir"), footer
- **Schema:** considerar `Action` (`JoinAction`) se justificável; baixa prioridade
- **CTA:** formulário de inscrição (Netlify Forms)

## `#participar` — Como participar

- **H2:** "Como participar" (id: `participar-title`)
- **Intenção:** Transactional (cluster 3 — queixas de bairro; e voluntariado, não mapeado antes no keyword-map)
- **Keywords:** como apresentar queixa autarquia Algarve, voluntariado ACIMHA, doações ACIMHA — **atualizar keyword-map.md com o cluster de voluntariado/doações, em falta**
- **Público-alvo:** munícipes com um problema concreto a reportar; voluntários; doadores
- **Propósito:** 4 cards de ação — partilhar experiência, candidatar-se (voluntariado), seguir redes sociais, contribuir (doação)
- **Internal links (saída):** 3 cards → `#contactos`; 1 card → `#associar`
- **Schema:** candidato a `HowTo` se o processo de "apresentar queixa" for detalhado futuramente (Fase 5 — AEO)
- **CTA:** "Partilhar experiência →", "Candidatar-me →", "Seguir nas redes →", "Contribuir →"
- **⚠️ Nota:** um dos CTAs ("Seguir nas redes") depende dos links sociais que ainda são `href="#"` — bloqueador conhecido

## `#contactos` — Contactos

- **H2:** "Contactos" (id: `contactos-title`)
- **Intenção:** Navigational/Transactional
- **Keywords:** contactar ACIMHA
- **Público-alvo:** qualquer visitante com uma questão direta
- **Propósito:** formulário de contacto + dados de contacto institucional
- **Internal links (entrada):** nav, `#participar` (x3), footer
- **Schema:** `ContactPoint` já coberto no JSON-LD global (Fase 4)
- **CTA:** formulário de contacto (modal, Netlify Forms)

## Modal `#obs-overlay` — Observatório da Habitação (16 Concelhos do Algarve)

- Não é uma secção com URL/âncora indexável de forma independente (é um `role="dialog"` acionado por JS a partir de `#projetos`)
- **Nota SEO:** conteúdo dentro de um modal só é indexável se estiver no DOM no carregamento inicial (confirmar se está, ou se é carregado dinamicamente — impacto direto na indexação dos dados por concelho)
- **Oportunidade futura:** se o Observatório evoluir para dados dinâmicos (backend em `estatistica/`, já identificado como protótipo separado), avaliar criar uma página própria indexável (`/observatorio` ou secção com âncora própria) em vez de manter só como modal

## Páginas legais autónomas

| Página | Title/Canonical | OG/Twitter | Nota |
|---|---|---|---|
| `politica-privacidade.html` | tem canonical | **sem OG/Twitter** | aceitável — não são páginas para partilhar (já sinalizado na auditoria) |
| `termos-condicoes.html` | tem canonical | **sem OG/Twitter** | idem |

---

## Correções a fazer no keyword-map.md (Fase 1) — descobertas nesta fase

1. **Cluster em falta:** Voluntariado e Doações (`#participar`) — não estava mapeado
2. **Correção de estrutura:** `#observatorio` não existe como âncora própria; é o modal `#obs-overlay` dentro de `#projetos` — key mapping deve refletir isto
3. **`#projetos` vs painel em `#quem-somos`:** confirmado agora que são secções **diferentes** (não há duplicação) — `#projetos` = os 3 eixos/projetos de habitação; `#quem-somos` = Missão/Valores/Órgãos Sociais/Documentos

---

## Oportunidades de internal linking identificadas (para Fase 10, mas já registadas aqui)

- `#missao` → ligar cada pilar à secção correspondente (`#participar` para tertúlias/queixas de bairro; `#projetos` para habitação)
- `#crise` → **UNKNOWN**, confirmar/adicionar link para `#projetos` ou Observatório
- `#quem-somos` → adicionar CTA para `#associar`

## Próximo passo

Este documento alimenta a **Fase 4 completa (Schema.org)** — já sabemos, secção a secção, que tipos de dados estruturados fazem sentido — e a **Fase 5 (AEO)**, onde `#participar` (queixas de bairro) é a melhor candidata a conteúdo em formato pergunta-resposta.
