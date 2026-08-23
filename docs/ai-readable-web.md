# Website AI-readable — ACIMHA

**Fase 7 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Documenta a decisão e o conteúdo do `llms.txt`
criado nesta fase, e confirma o alinhamento com `robots.txt`/`sitemap.xml` já existentes.

---

## O que é `llms.txt`

Convenção emergente (proposta por Answer.AI/`llmstxt.org`, **não é um standard oficialmente adotado por
todos os crawlers de IA** — ao contrário de `robots.txt`/`sitemap.xml`, que são protocolos estabelecidos)
para um ficheiro `/llms.txt` na raiz do site, em Markdown, com um resumo curto e legível por humanos e por
LLMs do que o site é e onde encontrar o quê. Alguns assistentes de IA e ferramentas de research já
experimentam consumi-lo; outros ainda não. Vale a pena ter porque é barato de manter e não tem
contrapartida negativa — mas não deve ser tratado como garantia de qualquer efeito mensurável.

## Conteúdo do `llms.txt`

Criado em `/llms.txt` (raiz do site, como exige a convenção). Estrutura:

1. **Título + resumo (blockquote):** identidade essencial da ACIMHA — associação cívica, sem fins
   lucrativos, apartidária, sede em Faro, objeto estatutário — retirado literalmente do modelo de entidade
   (`acimha-entity-model.md`) e do texto institucional aprovado, sem paráfrase que introduza factos novos.
2. **Parágrafo dos 4 eixos:** os mesmos 4 eixos documentados em toda a fase anterior, incluindo a nota
   explícita de que a ACIMHA **não é uma organização de issue único de habitação** — este é o
   diferenciador mais importante identificado na Fase 6, e o mais fácil de um sistema generativo
   simplificar incorretamente se não for reforçado explicitamente.
3. **Secção "Páginas principais":** as âncoras reais de `index.html` (`#missao`, `#crise`, `#projetos`,
   `#quem-somos`, `#noticias`, `#associar`, `#participar`, `#contactos`), com uma frase de descrição cada,
   consistente com `acimha-information-architecture.md`.
4. **Secção "Documentos":** os dois documentos legais e o PDF de estatutos, agora publicados
   (`assets/docs/estatutos_ACIMHA.pdf`).

**Deliberadamente excluído:** `/estatistica/` (o protótipo FastAPI + React do Observatório, não ligado ao
site principal) — consistente com o `Disallow: /estatistica/` já existente em `robots.txt`. O modal do
Observatório (`#obs-overlay`) também não tem entrada própria no `llms.txt`, porque — como já documentado
na Fase 2 — não tem uma URL diretamente acessível fora do modal renderizado por JS; é referido apenas
indiretamente na descrição da secção "A crise habitacional".

**Órgãos Sociais e detalhes dos 3 projetos de habitação:** não incluídos com detalhe no `llms.txt`, pela
mesma razão documentada nas Fases 5 e 6 — são conteúdo institucional ainda não confirmado, e um ficheiro
pensado para ser lido por sistemas de IA é exatamente o sítio errado para replicar informação não
verificada como se fosse facto estável.

## Alinhamento com `robots.txt` e `sitemap.xml`

| Ficheiro | Cobre | Estado |
|---|---|---|
| `robots.txt` | Regras de crawling — permite tudo exceto `/estatistica/` | Já existente (Fase 3), sem alterações necessárias |
| `sitemap.xml` | 3 URLs indexáveis (`/`, `/politica-privacidade.html`, `/termos-condicoes.html`), `lastmod` automático | Já existente (Fase 3), sem alterações necessárias |
| `llms.txt` | Resumo legível por humanos/LLMs da identidade, eixos e páginas principais | Novo nesta fase |

Os três ficheiros são consistentes entre si: nenhum aponta para `/estatistica/`, e as URLs listadas no
`llms.txt` (`#missao`, `#crise`, etc.) são âncoras dentro da única URL indexável real (`https://acimha.pt/`),
não páginas novas — não há contradição com o `sitemap.xml`, que corretamente só lista 3 URLs distintas.

## Limitação estrutural a repetir (já sinalizada nas Fases 2 e 6)

Por ser uma SPA de âncoras, o `llms.txt` lista "páginas" que na prática são secções da mesma URL. Isto é
aceitável para o propósito do ficheiro (ajudar um LLM a situar-se no conteúdo), mas não resolve a limitação
de fundo: um crawler que não execute JavaScript vê o HTML completo de todas as secções de qualquer forma
(não há lazy-loading de secções), pelo que isto não é, na prática, um problema de indexação — é só uma
nota de precisão sobre o que "página" significa neste contexto.
