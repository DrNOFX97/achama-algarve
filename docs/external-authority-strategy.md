# External Authority Strategy — ACIMHA (GEO externo)

**Fase 11 do Roadmap SEO + AEO + GEO + AIO (ACIMHA).** Regra explícita do roadmap: parcerias e menções só
contam quando **reais e verificáveis**. Esta fase não inventa nenhuma — audita o que existe hoje (pouco ou
nada) e propõe caminhos legítimos para construir autoridade externa ao longo do tempo.

---

## 1. Estado atual — auditoria

Pesquisei o repositório e o Notion do projeto antes de escrever este documento. Não encontrei nenhuma
menção, parceria ou citação externa real e verificável da ACIMHA enquanto entidade. Especificamente:

- **Imprensa:** a secção `#noticias` agrega imprensa sobre a *crise habitacional no Algarve* em geral —
  não é imprensa que mencione a ACIMHA. Nenhuma cobertura própria identificada.
- **Autarquias:** nenhuma parceria, protocolo ou menção institucional documentada.
- **Outras associações cívicas:** nenhuma parceria documentada.
- **Redes sociais:** os 4 links no footer/`#contactos` continuam `href="#"` — nem sequer existem perfis
  ligados, quanto mais verificados (ver `CLAUDE.md`, "Known placeholders").
- **Diretórios/registos oficiais:** o NIPC (519597265) e o Certificado de Admissibilidade (17/08/2026)
  confirmam que a associação está em processo de constituição formal, mas não encontrei prova de listagem
  pública em nenhum diretório de associações.
- **`sameAs` no JSON-LD:** propositadamente não implementado (ver `acimha-entity-model.md`, secção 7) por
  não haver ainda nenhum perfil verificado para apontar.

**Conclusão:** não há nada para implementar em código nesta fase — qualquer `sameAs`, citação ou link de
parceria seria fabricado. Esta fase é puramente estratégica.

---

## 2. Porque é que isto importa para GEO

Motores de resposta generativos (e a IA Overview do Google) tendem a confiar mais em entidades que têm
**corroboração externa independente** — não só o que a própria organização diz de si, mas o que terceiros
verificáveis dizem sobre ela. Uma associação recém-registada (domínio de 21/08/2026, Certificado de
Admissibilidade de 17/08/2026) está, por definição, ainda sem esse histórico. Isto não é um problema a
"resolver" tecnicamente — é uma fase natural de qualquer organização nova, e forçar sinais falsos seria
contraproducente (motores de IA e o próprio Google penalizam sinais de spam/manipulação mais do que
recompensam a ausência deles).

---

## 3. Caminhos legítimos a considerar (nenhum implementado nesta fase)

Nenhum destes itens foi executado — são recomendações para a ACIMHA avaliar e decidir, fora do âmbito de
código desta fase:

1. **Perfis de redes sociais reais** — o pré-requisito mais básico e mais barato. Assim que existirem,
   ligar no footer/`#contactos` (já placeholder, pronto a preencher) e adicionar `sameAs` ao JSON-LD `NGO`
   (ver `schema-strategy.md`/`acimha-entity-model.md` — já preparado para receber isto).
2. **Registo em diretórios de associações portuguesas** (ex.: Portal do Associativismo, registos
   camarários de associações de Faro/Algarve, se existirem) — corroboração institucional de baixo custo.
3. **Contacto com imprensa regional do Algarve** para cobertura da própria ACIMHA (não só do tema da
   crise habitacional) — ligado à Fase 8 (comunicados próprios), que é um pré-requisito prático: sem
   conteúdo próprio para noticiar, não há o que a imprensa cubra.
4. **Protocolos com autarquias** — mencionados como eixo de atuação ("participação cívica junto das
   autarquias") mas sem nenhuma parceria formal documentada ainda. Só adicionar ao site/JSON-LD quando
   existir um protocolo real e citável.
5. **Parcerias com outras associações cívicas/de habitação** — mencionado no roadmap como possível
   recurso cívico (ver também Fase 9, "Comparações", que sugeriu uma eventual página de recursos regionais
   não competitiva).

---

## 4. O que NÃO fazer

- Não adicionar `sameAs` a perfis de redes sociais que não existem.
- Não afirmar parcerias ou protocolos sem documento/confirmação real.
- Não comprar/trocar backlinks ou usar diretórios de baixa qualidade só para gerar sinais — motores de IA
  e o Google Search já penalizam isto, e seria inconsistente com o tom institucional rigoroso que a
  própria ACIMHA já definiu nos seus valores ("Transparência", "Rigor e Evidência" nas versões anteriores
  do texto de valores).

---

## 5. Próximo passo real

Esta fase fica **sem ação de código pendente** até que exista pelo menos um sinal real (ex.: um perfil de
rede social confirmado). Nessa altura, a alteração é pequena e já está mapeada: preencher os `href="#"`
do footer/`#contactos` e adicionar `sameAs` ao bloco `NGO` — ambos já identificados e prontos a executar
noutra sessão, quando a informação existir.
