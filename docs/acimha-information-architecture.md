# Arquitetura de Informação — ACIMHA

**Fase 2 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Documenta cada secção real do site tal como existe
hoje em `index.html`, `politica-privacidade.html` e `termos-condicoes.html`, cruzando com
`keyword-map.md` e `search-intent-map.md` (Fase 1). Não inventa informação institucional — onde o
conteúdo é placeholder/não confirmado, está assinalado como tal.

**Correção de âmbito face ao pedido original:** `acimha.pt` é uma página única (`index.html`) com
secções ligadas por âncora, mais duas páginas legais autónomas. **Não existe uma âncora `#observatorio`**
— o Observatório da Habitação é um modal (`#obs-overlay`) acionado a partir de `#crise` e `#projetos`,
sem URL própria pesquisável/partilhável. Documentado como tal abaixo, em vez de inventar uma secção que
não existe no código.

Título e meta description globais de `index.html` (aplicam-se à página toda, não por secção, porque é
SPA de âncoras):
- **Title:** `ACIMHA – Associação Cívica do Algarve`
- **Meta description:** `ACIMHA – Associação Cívica de Munícipes e Habitação do Algarve. Tertúlias, queixas de bairro, participação cívica e habitação a custo reduzido — a nossa frente mais desenvolvida.`
- **Canonical:** `https://acimha.pt/`
- **H1 único da página:** "A voz cívica dos munícipes do Algarve" (hero) — só existe um `<h1>` em todo o `index.html`; as restantes secções usam `<h2 class="section__title">`, o que está correto (uma página, um H1).

---

## 1. Hero — `#inicio`

- **URL/âncora:** `https://acimha.pt/#inicio`
- **Title/H1:** título da página (acima) / H1 único: "A voz cívica dos munícipes do Algarve"
- **Intenção de pesquisa:** NAVIGATIONAL (quem já procura a ACIMHA) + INFORMATIONAL (primeiro contacto)
- **Keywords associadas:** `acimha`, `associação cívica algarve`, `munícipes algarve`
- **Público-alvo:** qualquer visitante — ponto de entrada geral
- **Propósito:** apresentação imediata + ponte para missão e adesão
- **Internal links existentes:** "Associar-me agora" (abre modal de inscrição) · "Conhecer a missão" → `#missao`
- **Schema aplicável:** `Organization` (JSON-LD global, no `<head>`) — já implementado; `WebSite` também no `<head>`
- **CTA:** "Associar-me agora" (primário) · "Conhecer a missão" (secundário)

---

## 2. Missão — `#missao`

- **URL/âncora:** `https://acimha.pt/#missao`
- **H1 atual:** nenhum — usa `<h2 id="missao-title">A nossa missão</h2>`
- **Intenção de pesquisa:** INFORMATIONAL — resume os 4 eixos (habitação a custo reduzido, tertúlias, participação cívica, queixas de bairro)
- **Keywords associadas:** `habitação a custo reduzido algarve`, `direito à habitação digna`, `tertúlias comunitárias algarve`, `participação cívica algarve`, `queixas de bairro algarve`
- **Público-alvo:** visitantes a explorar o que a ACIMHA faz
- **Propósito:** comunicar os 4 eixos de atuação de forma resumida (citação DUDH Art. 25.º + 4 pilares numerados)
- **Internal links existentes:** nenhum dentro da secção (só nav global)
- **Schema aplicável:** nenhum aplicado; um `ItemList` para os 4 pilares seria consistente com Fase 4, mas não aplicar já (fora do âmbito desta fase)
- **CTA:** nenhum CTA de conversão próprio — secção informativa

---

## 3. A Crise — `#crise`

- **URL/âncora:** `https://acimha.pt/#crise`
- **H1 atual:** nenhum — `<h2 id="crise-title">A crise habitacional no Algarve</h2>`
- **Intenção de pesquisa:** INFORMATIONAL — diagnóstico com dados
- **Keywords associadas:** `crise habitacional algarve`, `aumento das rendas algarve`, `esforço de rendimento habitação`, `habitação social algarve`
- **Público-alvo:** munícipes afetados, jornalistas, investigadores, potenciais associados
- **Propósito:** 3 estatísticas (+180% rendas, 68% esforço, 12k em lista de espera) + texto de contexto + acesso ao Observatório
- **Internal links existentes:** botão "Ver Observatório da Habitação →" abre o modal `#obs-overlay`
- **Schema aplicável:** nenhum atualmente; estatísticas sem fonte citada inline no HTML — **as três estatísticas desta secção não têm fonte visível na página** (ao contrário do Observatório, que cita Idealista/INE/IHRU) — sinalizar para Fase 5 (AEO), não corrigir aqui sem confirmação da fonte real
- **CTA:** "Ver Observatório da Habitação →"

---

## 4. Projetos — `#projetos`

- **URL/âncora:** `https://acimha.pt/#projetos`
- **H1 atual:** nenhum — `<h2 id="projetos-title">Os nossos eixos de atuação</h2>`
- **Intenção de pesquisa:** mista — INFORMATIONAL (conhecer os projetos) + TRANSACTIONAL (2 dos 3 cards de habitação apontam para adesão)
- **Keywords associadas:** `observatório da habitação algarve`, `apoio jurídico habitação algarve`, `cohabitação algarve`, `habitação a custo reduzido algarve`, `tertúlias comunitárias algarve`, `participação cívica algarve`, `queixas de bairro algarve`
- **Público-alvo:** munícipes à procura de apoio concreto (jurídico/habitacional) + interessados nos outros 3 eixos
- **Propósito:** dois blocos — "Habitação a Custo Reduzido" (3 projetos, com conteúdo placeholder não confirmado, ver auditoria) e "Outras Frentes de Atuação" (Tertúlias, Queixas de Bairro, Participação Cívica, deliberadamente sem CTA — ver `CLAUDE.md`)
- **Internal links existentes:** "Saber mais →" em Clínica de Habitação (→ `#associar`) e Algarve Cohabita (→ `#associar`); Observatório da Habitação (→ abre `#obs-overlay`)
- **Schema aplicável:** nenhum atualmente; conteúdo dos 3 projetos ainda placeholder — **não aplicar `Project`/`Service` structured data até o texto ser confirmado institucionalmente**, para não publicar dados estruturados com informação não verificada
- **CTA:** "Saber mais →" nos 3 cards de habitação; nenhum nas 3 "Outras Frentes" (intencional, por design)

---

## 5. Quem Somos — `#quem-somos`

- **URL/âncora:** `https://acimha.pt/#quem-somos` (tabs internas sem âncora própria: Missão, Visão, Valores, Órgãos Sociais, Documentos)
- **H1 atual:** nenhum — `<h2 id="quem-somos-title">Quem somos</h2>`
- **Intenção de pesquisa:** NAVIGATIONAL/INFORMATIONAL — validar identidade/legitimidade da associação
- **Keywords associadas:** `acimha`, `associação cívica de munícipes e habitação do algarve`, `missão acimha`, `valores acimha`
- **Público-alvo:** visitantes a confirmar quem é a ACIMHA antes de se associarem ou confiarem os seus dados
- **Propósito:** Missão e Valores (conteúdo institucional aprovado, atualizado nesta sessão), Visão (texto existente, não alterado nesta tarefa), Órgãos Sociais (⚠️ **placeholder não confirmado** — nomes no `panel-orgaos` não verificados, ver `CLAUDE.md`), Documentos (Estatutos e Ficha de Inscrição já publicados; Regulamento Interno ainda placeholder, `regulamento.pdf` não existe no repo)
- **Internal links existentes:** "Estatutos" e "Ficha de Inscrição (PDF)" → ficheiros reais em `assets/docs/`; "Regulamento Interno" → `regulamento.pdf` (404, placeholder conhecido)
- **Schema aplicável:** nenhum aplicado; `member`/`founder` do `Organization` schema só deve ser usado quando os Órgãos Sociais forem confirmados — **não aplicar enquanto o conteúdo for placeholder**
- **CTA:** nenhum CTA de conversão direto — secção de confiança/prova social; os 2 downloads funcionais (Estatutos, Ficha) funcionam como CTA secundário

---

## 6. Notícias — `#noticias`

- **URL/âncora:** `https://acimha.pt/#noticias`
- **H1 atual:** nenhum — `<h2 id="noticias-title">Notícias e comunicados</h2>`
- **Intenção de pesquisa:** INFORMATIONAL
- **Keywords associadas:** `notícias habitação algarve`, `notícias crise habitacional algarve`
- **Público-alvo:** visitantes recorrentes, jornalistas, munícipes a acompanhar a crise
- **Propósito:** agregador de imprensa externa sobre habitação no Algarve, atualizado via GitHub Action horária a partir de `data/noticias.json` — **não é conteúdo próprio da ACIMHA**, apesar do título "Notícias e comunicados" sugerir isso (desalinhamento a considerar em Fase 8)
- **Internal links existentes:** cada notícia liga para a fonte externa; nenhum link interno
- **Schema aplicável:** nenhum atualmente; `NewsArticle` só faria sentido para comunicados próprios (ainda inexistentes), não para conteúdo agregado de terceiros
- **CTA:** nenhum

---

## 7. Observatório da Habitação — modal `#obs-overlay` (não é secção de scroll)

- **URL/âncora:** `https://acimha.pt/#obs-overlay` — âncora existe no DOM mas o conteúdo só é visível via JS (`observatory.js`); não há uma secção `#observatorio` navegável por scroll nem indexável de forma independente
- **Título dentro do modal:** "16 Concelhos do Algarve" (`obs-head__title`) — não é um H1/H2 de página, é interno ao modal
- **Intenção de pesquisa:** INFORMATIONAL/TRANSACTIONAL
- **Keywords associadas:** `observatório da habitação algarve`, `preço arrendamento por concelho algarve`, `renda m2 algarve concelhos`, `dados habitação algarve município`
- **Público-alvo:** investigadores, jornalistas, munícipes a comparar concelhos, potenciais associados
- **Propósito:** dados estáticos dos 16 concelhos (KPIs, tabela, evolução 2023→2025, ranking, fontes) — dataset hardcoded em `js/data/observatory-data.js`, não ligado ao backend `estatistica/`
- **Internal links existentes:** acionado a partir de `#crise` (botão) e `#projetos` (link do card Observatório)
- **Schema aplicável:** `Dataset` seria tecnicamente aplicável (dados tabulares com fontes citadas: Idealista, INE, IHRU, Terraruiva), mas está **fora do âmbito desta fase** — avaliar na Fase 4
- **Limitação estrutural a sinalizar:** por ser um modal renderizado via JS sem estado próprio na URL, o conteúdo do Observatório não é diretamente indexável nem partilhável por URL — impacto potencial em SEO/GEO a considerar nas fases seguintes

---

## 8. Associar — `#associar`

- **URL/âncora:** `https://acimha.pt/#associar`
- **H1 atual:** nenhum — `<h2 id="associar-title">Torne-se membro da ACIMHA</h2>`
- **Intenção de pesquisa:** TRANSACTIONAL
- **Keywords associadas:** `associar-me acimha`, `como me tornar sócio acimha`, `quota associação acimha`, `ficha de inscrição acimha`
- **Público-alvo:** visitantes já convencidos, prontos a agir
- **Propósito:** lista de 5 benefícios de ser sócio + card de CTA com quota (5€ semestral/anual)
- **Internal links existentes:** botão "Preencher Ficha de Inscrição" → abre modal `#inscricao-overlay`
- **Schema aplicável:** nenhum padrão diretamente aplicável a um formulário de adesão associativa
- **CTA:** "Preencher Ficha de Inscrição" — CTA principal da secção

---

## 9. Participar — `#participar`

- **URL/âncora:** `https://acimha.pt/#participar`
- **H1 atual:** nenhum — `<h2 id="participar-title">Como participar</h2>`
- **Intenção de pesquisa:** TRANSACTIONAL
- **Keywords associadas:** `voluntariado acimha`, `como posso ajudar acimha`, `doações acimha`
- **Público-alvo:** visitantes que querem contribuir sem se tornarem sócios formais
- **Propósito:** 4 formas de contribuir — Testemunhar, Voluntariar, Divulgar, Apoiar
- **Internal links existentes:** "Partilhar experiência →" e "Candidatar-me →" → `#contactos`; "Seguir nas redes →" → `#contactos` (⚠️ nota: os links reais de redes sociais no footer ainda são `href="#"`, por isso este CTA redireciona para contacto em vez de para uma rede social real); "Contribuir →" → `#associar`
- **Schema aplicável:** nenhum
- **CTA:** 4 CTAs, um por card

---

## 10. Contactos — `#contactos`

- **URL/âncora:** `https://acimha.pt/#contactos`
- **H1 atual:** nenhum — `<h2 id="contactos-title">Contactos</h2>`
- **Intenção de pesquisa:** TRANSACTIONAL/NAVIGATIONAL
- **Keywords associadas:** `contacto acimha`, `telefone acimha`, `email acimha`, `morada acimha faro`
- **Público-alvo:** qualquer visitante com uma questão concreta
- **Propósito:** morada, e-mail geral, telefone(s), horário de atendimento, redes sociais (placeholder) + CTA para modal de contacto
- **Internal links existentes:** botão "Enviar mensagem" → abre modal `#contact-overlay`; 4 ícones de redes sociais ainda `href="#"` (placeholder conhecido)
- **Schema aplicável:** `ContactPoint` — já usado no `Organization` JSON-LD global (dois pontos de contacto, geral e suporte, atualizado nesta sessão); consistente com o conteúdo desta secção
- **CTA:** "Enviar mensagem"

---

## 11. Páginas legais

### Política de Privacidade — `politica-privacidade.html`

- **URL:** `https://acimha.pt/politica-privacidade.html`
- **Title:** `Política de Privacidade e Cookies – ACIMHA`
- **Meta description:** `Política de Privacidade e Cookies da ACIMHA – Associação Cívica de Munícipes e Habitação do Algarve.`
- **H1 atual:** `Política de Privacidade e Cookies`
- **Canonical:** `https://acimha.pt/politica-privacidade.html`
- **Intenção de pesquisa:** NAVIGATIONAL — consulta antes de submeter dados pessoais
- **Keywords associadas:** `política de privacidade acimha`, `rgpd acimha`
- **Público-alvo:** visitantes prestes a submeter um formulário (inscrição/contacto)
- **Propósito:** compliance RGPD
- **Internal links existentes:** ligada a partir do footer de `index.html` e do texto de consentimento nos formulários de inscrição/contacto
- **Schema aplicável:** nenhum específico; **não tem JSON-LD `Organization`/`WebSite` próprio** (só `index.html` tem) — a avaliar em Fase 3/4 se vale a pena replicar
- **CTA:** nenhum — página de referência

### Termos & Condições — `termos-condicoes.html`

- **URL:** `https://acimha.pt/termos-condicoes.html`
- **Title:** `Termos & Condições – ACIMHA`
- **H1 atual:** `Termos & Condições`
- **Canonical:** `https://acimha.pt/termos-condicoes.html`
- **Intenção de pesquisa:** NAVIGATIONAL
- **Keywords associadas:** `termos e condições acimha`
- **Público-alvo:** visitantes a verificar condições de uso do site/associação
- **Propósito:** termos de utilização
- **Internal links existentes:** ligada a partir do footer de `index.html`
- **Schema aplicável:** nenhum específico; mesma nota do JSON-LD que a página de privacidade
- **CTA:** nenhum

---

## Observações transversais para as fases seguintes

- **Um único H1 em todo o site** (hero) é tecnicamente correto para SPA, mas significa que nenhuma secção
  tem um H1 próprio que reforce a keyword principal dessa secção para motores de busca — a considerar
  na Fase 3 (Technical SEO) se compensa introduzir H1s por âncora ou manter a estrutura atual.
- **Três blocos JSON-LD distintos no site**: `Organization` + `WebSite` em `index.html`; nenhum nas
  páginas legais. A decidir em Fase 4 se as páginas legais devem ter `WebPage`/`BreadcrumbList` próprio.
- **Conteúdo placeholder ainda por resolver** (não alterado nesta fase, apenas documentado): Órgãos
  Sociais, os 3 projetos de habitação, `regulamento.pdf`, redes sociais no footer/`#contactos`.
- **Queixas de Bairro** continua sem página/formulário dedicado apesar de intenção transacional clara
  (já assinalado em `search-intent-map.md`).
