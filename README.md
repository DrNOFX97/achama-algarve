# ACHAMA

**Associação Cívica e Habitação de Munícipes do Algarve**

Website institucional da ACHAMA — associação que defende o direito à habitação digna para todos os algarvios.

---

## Sobre o Projeto

Site estático de página única (SPA) desenvolvido em HTML, CSS e JavaScript puro, sem frameworks nem dependências externas.

## Como Correr

Não é necessário instalar nada. Abrir diretamente no browser:

```bash
open index.html
```

Ou servir localmente:

```bash
python3 -m http.server 8000
# Aceder em http://localhost:8000
```

## Estrutura

```
ACHAMA/
├── index.html          # Toda a aplicação (HTML + CSS + JS inline)
├── Logo 1-13.png       # Variantes do logótipo
└── Mapa_dos_municípios_do_Algarve.png
```

Todo o código (HTML, CSS e JavaScript) está contido num único ficheiro `index.html`.

## Tecnologias

- HTML5 semântico com atributos ARIA
- CSS3 (Grid, Flexbox, Custom Properties, animações)
- JavaScript vanilla (Intersection Observer, validação de formulários, scroll spy)
- Google Fonts: Playfair Display + Source Sans 3

## Secções

| Secção | Descrição |
|--------|-----------|
| `#inicio` | Hero com missão e CTAs |
| `#crise` | Estatísticas da crise habitacional |
| `#missao` | Missão e pilares da associação |
| `#projetos` | Projetos da associação |
| `#quem-somos` | Equipa e história |
| `#noticias` | Notícias e comunicados |
| `#associar` | Benefícios e formulário de adesão |
| `#participar` | Formas de participação |
| `#contactos` | Contactos e formulário de contacto |

## Deploy

Qualquer serviço de hosting estático é compatível (GitHub Pages, Netlify, Cloudflare Pages, etc.). Basta publicar `index.html` e as imagens.

## Estado Atual

- Formulários com validação client-side — **sem integração de backend** (os dados submetidos não são enviados para nenhum servidor)
- Secções `#projetos`, `#quem-somos` e `#noticias` com estrutura template mas sem conteúdo real
- Links de redes sociais e páginas legais ainda por configurar
