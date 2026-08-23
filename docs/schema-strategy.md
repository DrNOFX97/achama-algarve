# Schema.org Strategy — ACIMHA (AEO + GEO)

**Fase 4 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Avalia cada tipo de dados estruturados listado no
roadmap para uma associação cívica, decide o que implementar já (dados confirmados) e o que fica pendente
(depende de conteúdo institucional ainda placeholder). Regra do roadmap: **usar um tipo só quando
verdadeiro/confirmado** — nunca estruturar dados sobre algo ainda não validado institucionalmente.

---

## Decisões por tipo

### `NGO` (em vez de `Organization`) — ✅ implementado nesta fase

`NGO` é um subtipo de `Organization` em schema.org ("A non-governmental organization"), mais específico
para uma associação de direito privado sem fins lucrativos. O texto institucional aprovado já confirma
este estatuto ("associação de direito privado, sem fins lucrativos" — ver `estatutos_text.txt` e a Missão
publicada). Troca de `@type: "Organization"` para `@type: "NGO"` no bloco existente em `index.html`
(mantém todas as propriedades já validadas: nome, morada, NIPC, os dois `contactPoint`).

### `WebSite` — já implementado (Fase 1/integração de conteúdo), mantido

Já existia como bloco JSON-LD separado desde a atualização de Missão/Valores. Passa a ter `@id` próprio
(`https://acimha.pt/#website`) para poder ser referenciado a partir dos blocos `WebPage` novos.

### `WebPage` — ✅ implementado nesta fase, nas 3 páginas

Metadados genéricos e não-controversos (`url`, `name`, `description`, `inLanguage`, `isPartOf` → `WebSite`)
— replicam o que já está nas tags `<title>`/`<meta description>`/`<link canonical>` de cada página, sem
inventar nada. Aplicado a `index.html`, `politica-privacidade.html` e `termos-condicoes.html`.

### `BreadcrumbList` — ✅ implementado nesta fase, nas 2 páginas legais

Puramente estrutural/navegacional (Início → página legal) — não faz nenhuma afirmação institucional,
apenas reflete a hierarquia real de navegação (footer liga às páginas legais a partir da homepage). Não
aplicado a `index.html` porque é uma página única sem hierarquia de navegação (não faz sentido um
breadcrumb de uma página só).

### `FAQPage` — ❌ não aplicável agora

Não existe nenhuma secção de perguntas frequentes no site atual. Aplicar `FAQPage` sem conteúdo de FAQ
visível na página violaria as guidelines da Google (dados estruturados devem refletir conteúdo visível).
**Revisitar na Fase 5 (AEO)**, que já propõe perguntas frequentes reais dos munícipes ("Como posso
apresentar uma queixa sobre o meu bairro?", "Como me associo à ACIMHA?", "O que é a Clínica de
Habitação?") — só depois de esse conteúdo existir na página é que faz sentido o `FAQPage`.

### `Article` / `NewsArticle` — ❌ não aplicável agora

A secção `#noticias` agrega imprensa de terceiros via RSS (`data/noticias.json`) — não é conteúdo próprio
da ACIMHA. Marcar essas notícias como `Article` da ACIMHA seria uma afirmação de autoria falsa. Só se
aplica quando existir uma secção de comunicados/notícias próprios da associação, distinta do agregador
atual (já sinalizado como pendente em `CLAUDE.md` e na Fase 8 do roadmap).

### `GovernmentOrganization` — ❌ não aplicável

A ACIMHA é uma associação civil privada, não uma entidade governamental. Corretamente excluído.

### `CivicStructure` — ❌ não aplicável

`CivicStructure` em schema.org destina-se a estruturas físicas de utilidade cívica (bibliotecas, tribunais,
etc.), não a associações. Não se aplica a uma organização — `NGO` já cobre corretamente este caso.

---

## Tipo adicional avaliado (fora da lista original do roadmap)

### `Dataset` (Observatório da Habitação) — ❌ não implementado, recomendação para fase futura

Sinalizado como "a avaliar em Fase 4" no `technical-seo-implementation.md` (Fase 3). O Observatório tem
dados tabulares com fontes citadas (Idealista Índice, INE, IHRU, Terraruiva) — candidato razoável a
`Dataset`. **Não implementado nesta fase** por duas razões práticas:
1. O conteúdo só existe dentro de um modal renderizado por JavaScript (`#obs-overlay`), sem uma URL
   própria pesquisável — um crawler não vê este conteúdo sem executar JS, o que já limita o valor de o
   marcar como `Dataset` até essa limitação estrutural ser resolvida (assinalado na Fase 2).
2. Os dados são estáticos e mantidos manualmente em `js/data/observatory-data.js` — antes de os expor
   como `Dataset` estruturado publicamente, faz sentido confirmar que o processo de atualização desses
   dados é fiável (o `estatistica/` backend ainda não está ligado).

Recomendação: revisitar quando o Observatório tiver uma URL própria (não só modal) ou quando o backend
`estatistica/` for ligado.

### `ItemList` (pilares da Missão / projetos) — ❌ não implementado

Considerado na Fase 2 e aqui reavaliado: os 3 projetos de habitação em `#projetos` têm conteúdo ainda não
confirmado institucionalmente (placeholder — ver auditoria). Estruturar isso como `ItemList` publicaria
formalmente dados não validados. Os 4 pilares da Missão (`#missao`) são texto institucional já confirmado,
mas são resumos redundantes com a Missão/Valores já cobertos por `NGO` — baixo valor incremental para o
esforço. Não implementado; sem objeção a reconsiderar depois de os projetos serem confirmados.

---

## Implementação

### `index.html`

- `Organization` → `@type: "NGO"`, com `@id: "https://acimha.pt/#organization"` (mantém todas as
  propriedades existentes).
- `WebSite` ganha `@id: "https://acimha.pt/#website"`.
- Novo bloco `WebPage` com `isPartOf` a apontar para o `@id` do `WebSite`.

### `politica-privacidade.html` e `termos-condicoes.html`

- Novo bloco `WebPage` (mesmo padrão, `isPartOf` → `WebSite` de `index.html`).
- Novo bloco `BreadcrumbList` com 2 níveis: Início → página legal.

Nenhuma página legal ganha bloco `Organization`/`NGO` próprio — a entidade só é declarada uma vez em
`index.html`, seguindo o padrão comum de um único ponto de verdade para a organização.

---

## Requisitos de dados (NIPC, morada, email, telefone)

Todos já confirmados e já usados de forma consistente:
- **NIPC:** 519597265 (`taxID` no `NGO`)
- **Morada:** Rua Conselheiro Sebastião Teles, 2A, 8000-256 Faro (`address` no `NGO`)
- **Email/telefone:** dois `contactPoint` (geral: 917 812 306 / acimha.geral@gmail.com; suporte: 289 820
  840 / acimha@gmail.com)

Nenhum dado novo foi necessário para esta fase — tudo já estava confirmado desde a integração de conteúdo
institucional.
