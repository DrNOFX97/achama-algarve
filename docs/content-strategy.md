# Content Strategy — ACIMHA

**Fase 8 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Distingue os tipos de conteúdo que já existem no
site dos que estão apenas propostos, define governança (quem pode aprovar o quê) e considera como um site
estático sem CMS pode escalar conteúdo sem quebrar a filosofia "sem backend" do projeto (ver `CLAUDE.md`).

---

## 1. Tipos de conteúdo — existente vs. proposto

### Conteúdo institucional estático — existente
Secções de `index.html` e páginas legais. Editado manualmente, sem CMS nem pipeline de build. Fonte da
verdade: aprovação institucional direta — é o padrão já seguido em todas as fases anteriores deste
roadmap (Missão/Valores só foram atualizados depois de confirmados; Órgãos Sociais e os 3 projetos de
habitação continuam por confirmar e por isso não foram tocados).

### Notícias agregadas de imprensa — existente
`data/noticias.json`, gerado por `scripts/fetch-noticias.mjs`, atualizado horariamente via GitHub Action
(`atualizar-noticias.yml`). Cobre 4 queries de pesquisa (crise habitacional, habitação social, arrendamento
acessível, construção habitação). **Não é conteúdo próprio da ACIMHA** — é curadoria automática de imprensa
de terceiros sobre o tema, sem revisão editorial humana por item (aceitável, porque não é uma afirmação da
ACIMHA sobre si própria).

⚠️ **Imprecisão a sinalizar:** o título atual da secção é "Notícias **e comunicados**" (`#noticias-title`),
mas não existem comunicados próprios — só imprensa agregada. Isto foi já identificado no
`acimha-information-architecture.md` (Fase 2). Duas soluções possíveis, a decidir pela ACIMHA: (a) ajustar
o título para remover "e comunicados" enquanto não existirem, ou (b) criar de facto a capacidade de
comunicados próprios (ver secção 3). Não alterado nesta fase — é uma decisão de conteúdo, não técnica.

### Comunicados/notícias próprias — proposto, não implementado
Não existe hoje nenhum mecanismo. Requer decisão institucional (quem escreve, cadência, processo de
aprovação) que não está documentada em lado nenhum do repositório ou do Notion do projeto — **UNKNOWN**.
Quando existir, o tipo `Article`/`NewsArticle` já avaliado e propositadamente não aplicado na Fase 4 fica
desbloqueado.

### FAQ — proposto, Fase 5, pendente decisão
Banco de perguntas já pronto em `aeo-strategy.md`; implementação da secção visível ainda por decidir.

### Conteúdo educativo/recursos — proposto nesta fase, não escrito
Ideias de cluster de conteúdo informativo que apoiam intenção de pesquisa informacional (ver
`search-intent-map.md`) **sem depender de factos institucionais não confirmados** — ex.: um guia geral
sobre direitos do inquilino em Portugal. Isto é informação jurídica geral, não um facto sobre a ACIMHA, mas
**precisaria de revisão jurídica antes de publicar** — não é algo que deva ser escrito sem essa validação,
pela mesma disciplina de "não inventar" aplicada a conteúdo institucional. Ver `content-clusters.md` para
a lista de ideias — nenhuma foi redigida nesta fase, só mapeada.

---

## 2. Governança de conteúdo

| Tipo de conteúdo | Quem aprova | Precisão exigida |
|---|---|---|
| Institucional (missão, valores, projetos, órgãos sociais) | ACIMHA (aprovação formal) | Facto confirmado, zero invenção |
| Notícias agregadas | Automatizado (sem revisão humana por item) | Curadoria de terceiros, não afirmação própria |
| Comunicados próprios (futuro) | A definir pela ACIMHA | Facto institucional — mesma disciplina |
| Educativo/legal (futuro) | Revisão jurídica antes de publicar | Informação geral, mas juridicamente sensível |
| FAQ | Deriva de conteúdo já aprovado (ver `aeo-strategy.md`) | Sem invenção — só reformula o que já existe |

---

## 3. Escalabilidade sem CMS

O site não tem CMS nem backend de runtime (ver `CLAUDE.md`). Cada peça de conteúdo institucional novo
implica hoje uma edição manual de HTML. Isto é sustentável para o volume atual (site institucional
pequeno), mas não escalaria bem para um fluxo regular de comunicados próprios.

**Recomendação, não implementada agora** (decisão de produto, fora do âmbito de uma fase de estratégia):
se a ACIMHA decidir publicar comunicados com regularidade, replicar o padrão já validado pelas notícias
agregadas — ficheiros de conteúdo simples (Markdown ou JSON) + um script de build que gera o HTML
necessário — em vez de adotar um CMS completo, mantendo a filosofia "sem backend" do projeto. Isto é só
uma direção a considerar; não decidir isto no lugar da ACIMHA.

---

## Ver também

`docs/content-clusters.md` — mapeamento pillar/cluster dos 4 eixos, com o conteúdo existente e as ideias
de conteúdo futuro organizadas por eixo.
