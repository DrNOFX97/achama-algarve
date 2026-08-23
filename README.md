<p align="center">
  <img src="assets/images/ACIMHA.png" alt="Logótipo ACIMHA" width="220">
</p>

# ACIMHA

**Associação Cívica de Munícipes e Habitação do Algarve**

Website institucional da ACIMHA — uma associação cívica geral do Algarve, não um movimento de causa única. Atua em quatro eixos: Tertúlias (debates comunitários), Queixas de Bairro, Participação Cívica e Habitação a Custo Reduzido.

---

## Sobre o Projeto

Site estático multi-página em HTML, CSS e JavaScript puro (ES modules), sem build process, bundler ou backend. `index.html` é a página principal; `politica-privacidade.html` e `termos-condicoes.html` são páginas legais autónomas que partilham a mesma folha de estilos.

## Como Correr

Não é necessário instalar nada para a maior parte do site. Abrir diretamente no browser ou servir localmente:

```bash
python3 -m http.server 8000
# Aceder em http://localhost:8000
```

A única exceção é o script de notícias (ver abaixo), que requer `npm install` (dependência: `fast-xml-parser`). Nada em `node_modules/` é carregado pelo browser.

## Estrutura

```
ACIMHA/
├── index.html                     # Página principal
├── politica-privacidade.html      # Página legal
├── termos-condicoes.html          # Página legal
├── css/
│   ├── main.css                   # Design tokens, reset e estilos das secções
│   └── components/                # forms.css, inscricao.css, contact-modal.css
├── js/
│   ├── app.js                     # Ponto de entrada (type="module")
│   ├── modules/                   # ui-utils, forms, tabs, observatory, inscricao-modal, contact-modal, noticias
│   └── data/
│       └── observatory-data.js    # Dataset estático do Observatório da Habitação
├── data/
│   └── noticias.json              # Gerado pelo GitHub Action de notícias
├── scripts/
│   ├── fetch-noticias.mjs         # Alimenta data/noticias.json
│   └── update-sitemap-lastmod.mjs
├── estatistica/                   # Protótipo FastAPI + React, não ligado ao site estático
├── docs/                          # Documentação de estratégia SEO/AEO/GEO
└── assets/                        # Imagens, logótipos e documentos
```

## Tecnologias

- HTML5 semântico com atributos ARIA
- CSS3 (Grid, Flexbox, Custom Properties) — linguagem visual editorial (Monocle Magazine style): paleta cru/tinta/vermelho, tipografia serifada, sem cantos arredondados nem sombras
- JavaScript vanilla em módulos ES (Intersection Observer, validação de formulários, scroll spy)
- Google Fonts: Playfair Display + Source Serif 4 + Source Sans 3

## Secções (`index.html`)

| Secção | Descrição |
|--------|-----------|
| `#inicio` | Hero com missão e CTAs |
| `#missao` | Missão e pilares da associação |
| `#crise` | Estatísticas da crise habitacional |
| `#projetos` | Projetos de habitação + outras frentes de atuação |
| `#quem-somos` | Missão / Visão / Valores / Órgãos Sociais / Documentos (tabs) |
| `#noticias` | Notícias sobre habitação no Algarve, atualizadas automaticamente |
| `#associar` | Benefícios e formulário de adesão |
| `#participar` | Formas de participação |
| `#contactos` | Contactos e formulário de contacto |

## Formulários

`#inscricao-form` e `#contact-modal-form` usam a convenção Netlify Forms (`data-netlify="true"`). Só entregam submissões quando o site está alojado na Netlify — noutro hosting o POST falha silenciosamente.

## Notícias automáticas

`scripts/fetch-noticias.mjs` corre a cada hora via `.github/workflows/atualizar-noticias.yml`, consulta o Google News RSS para vários temas de habitação no Algarve, remove duplicados e escreve os 10 mais recentes em `data/noticias.json`, que é lido no cliente por `js/modules/noticias.js`.

## Observatório da Habitação

O modal `#obs-overlay` renderiza a partir do dataset estático `js/data/observatory-data.js` (16 municípios do Algarve). A pasta `estatistica/` (FastAPI + React) é um protótipo separado para uma futura versão com dados ao vivo — não está ligado ao site estático.

## Deploy

O site está preparado para Netlify (`netlify.toml`, Netlify Forms). Qualquer hosting estático funciona para o conteúdo, mas os formulários só entregam via Netlify.

## Estado Atual

- O separador "Documentos" em Quem Somos aponta para `regulamento.pdf`, que ainda não existe no repositório
- Os três projetos de habitação (Clínica de Habitação, Observatório da Habitação, Algarve Cohabita) e os Órgãos Sociais têm conteúdo placeholder, ainda não confirmado como cópia oficial
