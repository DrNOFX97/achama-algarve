# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**ACHAMA** (Associação Cívica e Habitação de Munícipes do Algarve) is a Portuguese civic association website focused on housing rights in the Algarve region. It is a **pure static single-page site** — no build process, no package manager, no backend.

## Running Locally

```bash
# Open directly in browser
open index.html

# Or serve locally
python3 -m http.server 8000
# Visit http://localhost:8000
```

No compilation, installation, or tooling required.

## Architecture

Everything lives in a single file: **`index.html`** (~1800 lines). It contains all HTML, embedded `<style>` CSS, and embedded `<script>` JavaScript. There is no separation into external files.

### CSS Structure (inside `<style>`)
- CSS custom properties at `:root` for colors, fonts, shadows
- Component styles: `.nav`, `.btn`, `.section`, `.container`
- Section-specific styles matching each `<section id="...">`
- Responsive breakpoint at `768px` (mobile-first)
- Animations via `.fade-in` / `.is-visible` classes

### JavaScript (inside `<script>`)
- **Nav scroll**: toggles `.nav--scrolled` class on scroll
- **Mobile menu**: hamburger toggle; closes on link click or Escape key
- **Scroll spy**: highlights active nav link based on scroll position
- **Intersection Observer**: triggers `.is-visible` on `.fade-in` elements
- **Tab component**: keyboard-accessible (arrow keys) with ARIA
- **Form validation**: real-time field validation with error display
  - `#membership-form` (adesão): name, surname, email, phone, municipality dropdown, motivation, GDPR consent
  - `#contact-form` (contactos): name, email, subject dropdown, message
  - Both show a success state on submit — **no backend integration exists**

### Page Sections (by `id`)
| `#inicio` | Hero with CTA |
| `#crise` | Housing crisis statistics |
| `#missao` | Mission and organizational pillars |
| `#projetos` | Project cards (template, unpopulated) |
| `#quem-somos` | About/team (minimal) |
| `#noticias` | News cards (template, unpopulated) |
| `#associar` | Membership benefits + registration form |
| `#participar` | Ways to get involved |
| `#contactos` | Contact info + contact form |

### Design Tokens
- Primary: `#1B3A6B` (navy blue)
- Accent: `#C4622D` (burnt orange)
- Background: `#F7F5F0` (off-white)
- Headings: Playfair Display (Google Fonts)
- Body: Source Sans 3 (Google Fonts)

## Known Incomplete Areas

- `#projetos`, `#quem-somos`, `#noticias` sections contain placeholder structure but no real content
- Social media links (`<a href="#">`) are not connected
- Legal links (Estatutos, Política de Privacidade) are placeholders
- Forms submit successfully on the client but send no data anywhere — backend integration needed

## Assets

PNG files at the root: `Logo 1.png` – `Logo 13.png` (logo variants) and `Mapa_dos_municípios_do_Algarve.png`.
