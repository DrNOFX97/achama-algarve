# Internal Linking Strategy — ACIMHA

**Fase 10 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Audita a ligação interna entre as quatro secções
que o roadmap pede explicitamente para conectar — Observatório da Habitação ↔ Crise Habitacional ↔
Projetos ↔ Associar-se — e fecha as ligações em falta.

---

## Auditoria — antes desta fase

| De → Para | Estado antes | Onde |
|---|---|---|
| Crise → Observatório | ✅ existia | Botão "Ver Observatório da Habitação →" em `#crise` |
| Projetos → Observatório | ✅ existia | Link "Saber mais →" no card do Observatório, `#projetos` |
| Projetos → Associar | ✅ existia | Links "Saber mais →" nos cards Clínica de Habitação e Algarve Cohabita |
| Observatório → Crise | ❌ em falta | — |
| Crise → Projetos | ❌ em falta | — |
| Associar → Projetos | ❌ em falta | — |

A cadeia já tinha ligação num só sentido (Crise → Observatório → Projetos → Associar), mas nenhuma ligação
de retorno — quem chegava ao Observatório ou à Associação não tinha caminho direto de volta às outras
peças do mesmo argumento.

---

## Ligações adicionadas nesta fase

### 1. Observatório → Crise

Novo link no rodapé do modal do Observatório (`obs-footer`, `index.html`): "Ver a crise habitacional no
Algarve →", a par das fontes de dados (ine.pt, ihru.pt) já existentes.

**Detalhe técnico:** o modal do Observatório é controlado inteiramente por JS via toggle da classe
`is-open` em `#obs-overlay` (`js/modules/observatory.js`), não por navegação de hash. Um link `<a
href="#crise">` normal dentro do modal navegaria a hash mas **deixaria o overlay aberto por cima do
conteúdo**, escondendo a secção para onde a página acabou de fazer scroll — uma armadilha de UX comum em
modais deste tipo. Por isso, o novo link tem `id="obs-link-crise"` e um listener dedicado
(`crisisLink.addEventListener("click", closeObs)`) que fecha o modal antes da navegação da hash prosseguir
normalmente.

### 2. Crise → Projetos

Novo botão secundário junto ao CTA existente em `#crise`: "Conhecer os nossos projetos →", com a classe
`btn--outline-dark` já usada no mesmo padrão no hero (`#inicio`) — não introduz nenhum componente novo,
reutiliza o sistema de botões existente.

### 3. Associar → Projetos

Novo link de texto no fim da lista de benefícios em `#associar`: "Conheça os nossos projetos de habitação
→", estilo consistente com outros links de texto já usados no site (cor `--color-accent`, peso 600).

---

## Estado depois desta fase

| De → Para | Estado |
|---|---|
| Crise ↔ Observatório | ✅ bidirecional |
| Crise ↔ Projetos | ✅ bidirecional |
| Projetos ↔ Associar | ✅ (Projetos → Associar já existia; Associar → Projetos novo) |
| Projetos ↔ Observatório | ✅ (já existia; Observatório → Projetos não adicionado diretamente — alcança-se em 2 saltos via Crise, considerado suficiente) |

A cadeia pedida pelo roadmap (Observatório ↔ Crise ↔ Projetos ↔ Associar-se) está agora ligada em ambos os
sentidos em cada par adjacente.

---

## Fora do âmbito desta fase

- **Links a partir de conteúdo ainda placeholder** (Órgãos Sociais, detalhes dos 3 projetos) não foram
  tocados — a ligação interna não deve reforçar conteúdo não confirmado.
- **Ligação a partir de Queixas de Bairro** não foi acrescentada a este grupo — não tem CTA/página própria
  (por design, ver `CLAUDE.md`), e associá-la à Associação for já uma decisão de conteúdo pendente (ver
  `content-strategy.md`), não uma questão de linking.
- **`#noticias`** não foi ligado a este grupo — é conteúdo agregado de terceiros, não uma peça editorial
  própria da ACIMHA que beneficie de reforço de PageRank interno neste conjunto.
