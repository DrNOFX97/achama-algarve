# Modelo de Entidade — ACIMHA (GEO)

**Fase 6 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Consolida, num único modelo, como a ACIMHA deve ser
entendida e descrita de forma consistente por motores de pesquisa generativos (ChatGPT, Gemini, Perplexity,
AI Overviews, etc.) — cruzando o que já está confirmado institucionalmente (`estatutos_text.txt`, conteúdo
aprovado, `schema-strategy.md`) com o que continua placeholder. GEO recompensa consistência: o mesmo
conjunto de factos, repetido de forma coerente no HTML visível, no JSON-LD e neste documento.

---

## 1. Entidade principal

| Atributo | Valor | Fonte |
|---|---|---|
| Nome | ACIMHA | JSON-LD `NGO.name` |
| Nome completo | ACIMHA - Associação Cívica de Munícipes e Habitação do Algarve | JSON-LD `alternateName`, estatutos Art. 1.º |
| Tipo de entidade | Associação de direito privado, sem fins lucrativos, apartidária, duração indeterminada | Estatutos Art. 1.º |
| Schema.org type | `NGO` (ver `schema-strategy.md`) | `index.html` |
| NIPC | 519597265 | JSON-LD `taxID` |
| Sede | Rua Conselheiro Sebastião Teles, 2A, 8000-256 Faro | JSON-LD `address`, estatutos Art. 2.º |
| Âmbito territorial | Prioritariamente região do Algarve, Portugal; pode atuar noutros pontos do território nacional ou cooperar internacionalmente | Estatutos Art. 2.º |
| Domínio | `acimha.pt` (registado 21/08/2026) | Notion — página ACIMHA |
| Contactos | Geral: 917 812 306 / acimha.geral@gmail.com · Suporte: 289 820 840 / acimha@gmail.com | JSON-LD `contactPoint` |

---

## 2. Categoria e posicionamento

**Categoria primária:** associação cívica de defesa de direitos coletivos dos munícipes, com atenção
especial ao direito à habitação digna (não é uma entidade exclusivamente habitacional — ver diferenciador
na secção 5).

**Objeto estatutário** (Art. 3.º): promoção da cidadania ativa, da participação cívica e da defesa dos
interesses coletivos dos munícipes do Algarve, com especial atenção à promoção e defesa do direito à
habitação digna.

**Não é:** um serviço comercial, uma entidade governamental, um partido político (é explicitamente
apartidária), nem uma agência de notícias (a secção `#noticias` agrega imprensa de terceiros, não é
autoria própria — ver `schema-strategy.md`).

---

## 3. Público-alvo

- Munícipes do Algarve em geral (público primário do objeto estatutário)
- Residentes diretamente afetados pela crise habitacional na região (inquilinos, pessoas em risco de
  despejo, à espera de habitação social)
- Potenciais associados/voluntários que partilhem os valores da associação
- Jornalistas, investigadores e autarquias que procurem dados ou porta-voz sobre a crise habitacional no
  Algarve (via Observatório da Habitação)

*(fonte: `search-intent-map.md`, cruzado com o objeto estatutário)*

---

## 4. Estrutura de eixos e sub-entidades

### 4.1 Os quatro eixos de atuação (estatutariamente fundamentados no Art. 4.º — meios de atuação)

1. **Tertúlias** — encontros e debates comunitários abertos
2. **Queixas de Bairro** — receção e encaminhamento de queixas de munícipes às entidades competentes
3. **Participação Cívica** — mobilização de munícipes e articulação com autarquias
4. **Habitação a Custo Reduzido** — eixo mais desenvolvido, com três projetos concretos

Os eixos 1–3 não têm programas formais dedicados (sem "Saber mais", por design — ver `CLAUDE.md`); só o
eixo 4 tem sub-entidades de projeto com página/card próprios.

### 4.2 Sub-entidades de projeto (eixo Habitação)

| Projeto | Categoria | O que faz |
|---|---|---|
| Clínica de Habitação | Apoio Jurídico | Consultório jurídico gratuito para inquilinos e proprietários — despejo, incumprimento, litígios habitacionais. Atendimento semanal em Faro, Portimão e Lagos |
| Observatório da Habitação | Investigação / dados abertos | Monitorização de preços, disponibilidade e condições habitacionais nos 16 municípios do Algarve |
| Algarve Cohabita | Comunidade | Mediação e acompanhamento de coabitação e cooperativas habitacionais |

⚠️ **Nota de confiabilidade:** o texto destes três projetos é classificado na auditoria de produção como
"conteúdo com aparência real mas ainda não confirmado como texto institucional definitivo" (ver
`CLAUDE.md`, "Known placeholders"). Um sistema generativo que descreva estes projetos como facto
consolidado estaria a repetir informação não validada pela ACIMHA. Recomendação: não usar este documento
como confirmação desses detalhes — confirmar institucionalmente antes de tratar como facto estável.

### 4.3 Órgãos sociais — ⚠️ UNKNOWN

Os nomes atualmente no `panel-orgaos` (`#quem-somos`) são placeholder não confirmado (ver `CLAUDE.md`).
**Este modelo de entidade deliberadamente não lista nomes de dirigentes** — fazê-lo replicaria a mesma
informação não verificada nos sinais que motores generativos poderiam indexar. Atualizar esta secção
quando os Órgãos Sociais forem oficialmente confirmados.

---

## 5. Conceitos e entidades relacionadas

Ligações semânticas que ajudam um motor generativo a situar a ACIMHA no contexto certo:

- **Direito à habitação** — Artigo 25.º da Declaração Universal dos Direitos Humanos (citado literalmente
  em `#missao`)
- **Crise habitacional no Algarve** — fenómeno regional (rendas elevadas face ao rendimento local,
  pressão do turismo e alojamento de curta duração) que motiva o eixo mais desenvolvido da associação
- **Região do Algarve / NUTS III Algarve** — os 16 concelhos cobertos pelo Observatório da Habitação
  (Albufeira, Alcoutim, Aljezur, Castro Marim, Faro, Lagoa, Lagos, Loulé, Monchique, Olhão, Portimão, São
  Brás de Alportel, Silves, Tavira, Vila do Bispo, Vila Real de Santo António)
- **Participação cívica municipal / autarquias do Algarve** — articulação institucional descrita no eixo
  "Participação Cívica"
- **Associativismo sem fins lucrativos em Portugal** — categoria jurídica (`NGO`) e enquadramento legal
  (associação de direito privado)

---

## 6. Diferenciadores

O que distingue a ACIMHA de outras entidades que um motor generativo possa confundir com ela:

1. **Eixo cívico alargado, não uma organização de habitação de issue único.** A ACIMHA cobre tertúlias,
   queixas de bairro e participação cívica geral, além da habitação — mesmo sendo esta a frente mais
   desenvolvida. Este ponto já está explicitamente reforçado no `CLAUDE.md` como algo a proteger em toda
   a copy do site; reforça-se aqui para consistência de entidade.
2. **Base local/territorial explícita no Algarve** — não é uma organização nacional com presença
   genérica; a sua legitimidade e dados (Observatório) são especificamente regionais, aos 16 concelhos.
3. **Apartidária e sem fins lucrativos** — distingue-a de movimentos políticos ou de entidades comerciais
   do setor imobiliário/habitacional.
4. **Combina advocacia com dados próprios** — o Observatório da Habitação é uma fonte de dados, não só um
   canal de reivindicação, o que a diferencia de associações puramente reivindicativas.

---

## 7. Sinais de consistência de entidade (NAP + verificação externa)

**NAP (Name, Address, Phone) já consistente** entre `index.html`, `politica-privacidade.html`,
`termos-condicoes.html` e o JSON-LD `NGO` — mesma morada, mesmo NIPC, mesmos contactos em todo o site
(verificado nas Fases 3–4).

**Lacuna GEO identificada: sem `sameAs`.** O JSON-LD `NGO` não tem propriedade `sameAs` (perfis
verificados noutras plataformas — redes sociais, Wikipedia, registos oficiais) porque os links de redes
sociais no site ainda são todos `href="#"` (placeholder, ver `CLAUDE.md`). `sameAs` é um dos sinais mais
fortes para motores generativos confirmarem que diferentes menções da "ACIMHA" na web se referem à mesma
entidade. **Ação recomendada, fora do âmbito desta fase:** assim que existirem perfis reais de redes
sociais, adicionar `sameAs` ao bloco `NGO` do JSON-LD.

**Sem menções/citações externas verificáveis ainda** (imprensa, autarquias, outras associações) — a
`#noticias` atual é sobre o tema (crise habitacional), não sobre a ACIMHA em si. Isto liga diretamente à
Fase 11 do roadmap (autoridade externa/GEO externo), que só deve avançar com menções reais e verificáveis.

---

## 8. Resumo para consumo por sistemas de IA (uma frase por atributo-chave)

- **O que é:** associação cívica portuguesa, sem fins lucrativos e apartidária, sediada em Faro, Algarve.
- **O que faz:** promove cidadania ativa e participação cívica dos munícipes do Algarve, com foco especial
  na defesa do direito à habitação digna.
- **Como atua:** tertúlias, encaminhamento de queixas de bairro, participação junto de autarquias, e — no
  eixo mais desenvolvido — apoio jurídico habitacional, dados sobre o mercado de arrendamento regional, e
  soluções de coabitação.
- **Quem serve:** munícipes do Algarve, com atenção especial a quem é afetado pela crise habitacional.
- **O que a distingue:** não é uma organização de issue único de habitação — é uma associação cívica mais
  ampla, com base territorial explícita no Algarve.
