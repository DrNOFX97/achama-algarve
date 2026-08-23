# AEO Strategy — ACIMHA (Answer Engine Optimization)

**Fase 5 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Aplica as três regras do roadmap ao conteúdo real do
site: banco de FAQs candidatas (só com respostas já suportadas por conteúdo publicado — nada inventado),
auditoria de "resposta concisa no topo de cada secção", e revisão das estatísticas da secção "Crise
habitacional".

---

## 1. Banco de perguntas frequentes candidatas

Todas as respostas abaixo são **extraídas do texto já publicado no site** (`index.html`) — nenhuma
reformulação introduz facto novo. Onde a resposta real ainda não existe no site (Queixas de Bairro), está
assinalado como lacuna, não preenchido com invenção.

### Eixo 1 — Habitação

**O que é a Clínica de Habitação?**
Consultório jurídico gratuito para inquilinos e proprietários, com apoio em casos de despejo,
incumprimento e litígios habitacionais. Atendimento semanal em Faro, Portimão e Lagos.
*(fonte: card "Clínica de Habitação", `#projetos`)*

**O que é o Observatório da Habitação?**
Plataforma de dados sobre preços, disponibilidade e condições do parque habitacional nos 16 municípios do
Algarve. *(fonte: card "Observatório da Habitação", `#projetos` + modal `#obs-overlay`)*

**O que é o Algarve Cohabita?**
Programa de mediação e acompanhamento de coabitação e cooperativas habitacionais, criando soluções
alternativas e acessíveis para trabalhadores e jovens da região. *(fonte: card "Algarve Cohabita",
`#projetos`)*

### Eixo 2 — Cidadania e participação cívica

**O que são as Tertúlias da ACIMHA?**
Encontros e debates comunitários abertos sobre os temas que mais afetam o dia a dia das localidades
algarvias. *(fonte: `#missao` pilar 01 / `#projetos`)*

**Como participa a ACIMHA junto das autarquias?**
Mobiliza munícipes na resolução de problemas locais, em articulação direta com as autarquias do Algarve.
*(fonte: `#missao` pilar 03 / `#projetos`)*

### Eixo 3 — Queixas de bairro

**Como posso apresentar uma queixa sobre o meu bairro?** ⚠️ **lacuna de conteúdo**
O site descreve o que a ACIMHA faz ("recebemos e encaminhamos as queixas dos munícipes... junto das
entidades competentes") mas **não indica como submeter uma queixa** — não há formulário, morada de e-mail
dedicada nem processo descrito, só a secção genérica de Contacto. Uma FAQ que responda com precisão a
esta pergunta exige primeiro decidir o mecanismo real (já sinalizado em `search-intent-map.md` como o
maior desalinhamento entre intenção e oferta do site). Sem essa decisão de produto, a resposta mais
honesta possível hoje é "contacte-nos através da secção Contactos", que é fraca para AEO porque não
responde à intenção real. Não implementar esta FAQ com uma resposta fabricada.

### Eixo 4 — A Associação

**O que é a ACIMHA?**
A ACIMHA — Associação Cívica de Munícipes e Habitação do Algarve tem como missão promover a cidadania
ativa e a participação cívica, representar e defender os interesses coletivos dos munícipes e contribuir
para o desenvolvimento social e a melhoria das condições de vida no Algarve. *(fonte: `#quem-somos`,
painel Missão)*

**Como me associo à ACIMHA?**
Preenchendo a ficha de inscrição oficial disponível no site. O processo é simples e a quota é de 5€
(semestral ou anual). *(fonte: `#associar`)*

**Quanto custa ser sócio da ACIMHA?**
5€ por período — semestral ou anual. *(fonte: `#associar`)*

**Quais são os benefícios de ser sócio?**
Acesso à Clínica Jurídica, relatórios e dados exclusivos do Observatório, direito de voto em Assembleia
Geral, rede de contactos e voz ativa em iniciativas e grupos de trabalho. *(fonte: `#associar`)*

**Posso contribuir para a ACIMHA sem ser sócio?**
Sim — pode partilhar um testemunho, voluntariar-se, divulgar o trabalho da associação ou apoiar
financeiramente através de doações. *(fonte: `#participar`)*

**Como contacto a ACIMHA?**
Por e-mail, telefone ou através do formulário de contacto no site; morada em Rua Conselheiro Sebastião
Teles, 2A, 8000-256 Faro. *(fonte: `#contactos`)*

**Quais são os valores da ACIMHA?**
Cidadania e Participação, Solidariedade, Igualdade, Transparência, Habitação Digna, Sustentabilidade e
Compromisso com o Algarve. *(fonte: `#quem-somos`, painel Valores)*

---

## 2. Auditoria — "resposta concisa no topo de cada secção"

| Secção | Já abre com resposta direta? | Nota |
|---|---|---|
| Hero (`#inicio`) | ✅ | `hero__desc` posiciona a ACIMHA nas 2 primeiras frases |
| Missão (`#missao`) | ⚠️ parcial | Abre com citação da DUDH antes dos 4 pilares — editorialmente forte, mas adia a resposta direta "o que fazemos" |
| Crise (`#crise`) | ⚠️ parcial | Abre com estatísticas (ver secção 3) antes do parágrafo explicativo — funciona melhor para dados do que para resposta textual direta |
| Projetos (`#projetos`) | ✅ | Subtítulo resume logo os 4 eixos |
| Quem Somos → Missão (`#quem-somos`) | ✅ | Primeira frase já é a resposta a "o que é a ACIMHA" |
| Notícias (`#noticias`) | n/a | Lista, não texto explicativo |
| Associar (`#associar`) | ✅ | Subtítulo + lista de benefícios direta |
| Participar (`#participar`) | ✅ | Subtítulo resume as 4 formas de contribuir |
| Contactos (`#contactos`) | ✅ | Informação direta, sem preâmbulo |
| Páginas legais | ✅ | Primeira frase já identifica o responsável pelo tratamento |

**Conclusão:** a maioria das secções já cumpre a regra. Não recomendo reescrever `#missao` (citação DUDH é
uma escolha editorial deliberada do design system, não um problema de AEO) nem `#crise` (números primeiro
é um padrão editorial válido para uma secção de dados) — mudar isso é uma decisão de copy/design, fora do
âmbito de uma fase técnica de AEO, e não foi pedido.

---

## 3. H2/H3 em formato pergunta

Os títulos de secção atuais (`A nossa missão`, `A crise habitacional no Algarve`, `Quem somos`, etc.) são
identidade editorial estabelecida do design system "Monocle Magazine" (ver `CLAUDE.md`) — reescrevê-los
como perguntas ("O que é a ACIMHA?") quebraria esse tom institucional sem ganho claro, já que o conteúdo
imediatamente a seguir já responde à pergunta implícita.

**Recomendação:** aplicar o formato de pergunta apenas a uma eventual secção de FAQ nova (ver secção 5),
não retroativamente aos títulos de secção existentes.

---

## 4. Estatísticas da secção "Crise habitacional" — ⚠️ não verificadas

A secção `#crise` apresenta três números sem fonte citada no HTML:

- **+180%** — "Aumento das rendas" (10 anos)
- **68%** — "Esforço de rendimento" (famílias que gastam mais de 40% do rendimento em habitação)
- **12k** — "Famílias em lista de espera" para habitação social, com espera média de 8+ anos

Ao contrário do Observatório da Habitação (que cita explicitamente Idealista, INE, IHRU e Terraruiva por
número), **estas três estatísticas não têm fonte identificável no repositório nem no Notion do projeto**
— pesquisei ambos antes de escrever este documento. Por regra do roadmap ("não inventes... números da
crise habitacional; se não for verificável, marca como UNKNOWN"), estes três valores ficam classificados
como **UNKNOWN quanto à fonte**.

**Isto não significa que os números estejam errados** — só que não posso confirmá-los nem citá-los como
verificados. Publicar dados estatísticos sem fonte é também um risco direto para AEO/GEO: sistemas de IA
e motores de resposta tendem a penalizar ou ignorar afirmações numéricas não verificáveis.

**Opções a decidir (não posso escolher por conta própria):**
1. Se existir uma fonte real (INE, IHRU, Idealista, etc.) para estes três números, fornecê-la para eu
   adicionar a citação no HTML, tal como já acontece no Observatório.
2. Se os números forem estimativas/ilustrativos sem fonte formal, marcar isso explicitamente na página
   (ex.: "estimativa ACIMHA" em vez de apresentá-los como facto absoluto).
3. Se não houver forma de confirmar, considerar substituir por dados que já têm fonte confirmada — por
   exemplo, os que já estão citados no Observatório (Idealista Dez 2025: Algarve +30% vs. nacional; INE
   Q1 2025: renda mediana 9,92€/m² +10% YoY).

Não alterei o HTML da secção Crise nesta fase — só a estratégia. Qualquer alteração ao conteúdo dessa
secção depende de uma destas três decisões.

---

## 5. Recomendação de implementação (a decidir)

Este documento é a estratégia (entregável da Fase 5). A implementação de uma secção de FAQ visível no
site — o que também desbloquearia o `FAQPage` schema.org deixado pendente na Fase 4 — é uma decisão de
conteúdo/design maior do que as fases técnicas anteriores (nova secção visual, ligação no nav/footer,
respeito pelo design system `.stats-feature`). Proposta: usar o banco de perguntas da secção 1 (excluindo
"Queixas de Bairro", que não tem resposta real ainda) para uma secção de FAQ nova, mas só depois de
confirmação explícita — não implementado automaticamente nesta fase.
