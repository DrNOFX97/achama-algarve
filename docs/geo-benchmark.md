# GEO Benchmark — Visibilidade da ACIMHA em Assistentes de IA

**Fase 12 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Testa se assistentes de IA generativos conseguem
descrever corretamente a ACIMHA, a sua missão e os seus projetos.

**Limitação honesta desta sessão:** não tenho forma de interrogar ChatGPT, Gemini, Perplexity ou outros
assistentes a partir deste ambiente (sem acesso às respetivas interfaces/contas) — só posso desenhar a
metodologia e um resultado de referência bem fundamentado. **A execução real do benchmark (fazer as
perguntas a cada assistente e registar as respostas) tem de ser feita por ti**, noutra sessão/dispositivo.
`geo-benchmark.json` já está pronto como template a preencher.

---

## 1. Expectativa de base, antes de testar

O domínio `acimha.pt` foi registado em 21/08/2026 e o Certificado de Admissibilidade é de 17/08/2026 — a
ACIMHA é, à data, **uma entidade recém-criada**. Os principais assistentes de IA têm datas de corte de
treino anteriores ao lançamento do site, e mesmo depois de publicado, indexação e re-treino/atualização de
conhecimento não são imediatos.

**Resultado esperado, realisticamente:** a maioria dos assistentes **não deve ter nenhum conhecimento
prévio da ACIMHA** e deve dizer isso claramente ("não tenho informação sobre esta organização") em vez de
inventar uma resposta. Isto **não é uma falha** — é o comportamento correto e desejável para uma entidade
nova. O que se torna um problema de GEO é:
1. Um assistente **inventar** factos sobre a ACIMHA em vez de admitir que não sabe (o risco a vigiar).
2. Um assistente **confundir** a ACIMHA com outra organização (ex.: assumir que é uma organização
   exclusivamente de habitação, o diferenciador mais frágil já identificado na Fase 6).
3. Assistentes com acesso a pesquisa web em tempo real (ex.: Perplexity, ChatGPT com browsing, Gemini com
   Search) **conseguirem** encontrar e descrever corretamente o site, uma vez que este esteja indexado —
   este é o teste mais informativo, porque reflete o que o `llms.txt`, o Schema.org e o conteúdo (Fases
   4–7) realmente conseguem comunicar.

---

## 2. Perguntas de teste

As 7 perguntas cobrem identidade, os 4 eixos, os 2 projetos mais citáveis, adesão e o diferenciador mais
frágil. Critérios de correção derivados de `acimha-entity-model.md` — nada aqui introduz factos novos.

| # | Pergunta | O que uma resposta correta deve incluir |
|---|---|---|
| 1 | O que é a ACIMHA? | Associação cívica portuguesa, sem fins lucrativos, apartidária, sede em Faro/Algarve |
| 2 | Quais são os eixos de atuação da ACIMHA? | Tertúlias, queixas de bairro, participação cívica, habitação a custo reduzido |
| 3 | A ACIMHA é uma organização exclusivamente de habitação? | Não — eixo cívico mais alargado; habitação é a frente mais desenvolvida, não a única |
| 4 | O que é a Clínica de Habitação da ACIMHA? | Apoio jurídico gratuito a inquilinos/proprietários, despejo/litígios |
| 5 | O que é o Observatório da Habitação da ACIMHA? | Dados de preços/disponibilidade habitacional nos 16 municípios do Algarve |
| 6 | Como me associo à ACIMHA? | Ficha de inscrição, quota 5€ semestral/anual |
| 7 | Onde fica a sede da ACIMHA? | Rua Conselheiro Sebastião Teles, 2A, Faro |

---

## 3. Classificação de respostas

- **Sem conhecimento (aceitável):** o assistente admite não ter informação — comportamento correto para
  uma entidade nova, não penalizar.
- **Correto:** resposta alinhada com os critérios acima, mesmo que resumida.
- **Parcialmente correto:** acerta a categoria geral (ex.: "associação portuguesa") mas erra ou omite
  detalhes relevantes (ex.: diz que é só sobre habitação).
- **Incorreto/alucinado:** inventa factos que não constam de nenhuma fonte da ACIMHA — o resultado mais
  grave, porque significa que o assistente está a confundir a entidade com outra ou a preencher lacunas
  com invenção.

---

## 4. Como executar (a fazer por ti)

1. Abrir cada assistente a testar (sugestão: ChatGPT, Gemini, Perplexity, Claude, Copilot — os que
   fizerem sentido) em modo sem histórico de conversa anterior (para não enviesar a resposta).
2. Fazer as 7 perguntas da secção 2, uma de cada vez, em conversas separadas se possível.
3. Registar cada resposta em `geo-benchmark.json`, seguindo a estrutura já preparada (um objeto por
   combinação assistente × pergunta), com a classificação da secção 3.
4. Repetir passado alguns meses, depois de o site estar indexado — o valor real deste benchmark é a
   **comparação ao longo do tempo**, não um resultado único.

---

## 5. `geo-benchmark.json`

Template estruturado, com as 7 perguntas e critérios já preenchidos e um array `resultados` vazio, pronto
a preencher com execuções reais. Ver ficheiro ao lado.
