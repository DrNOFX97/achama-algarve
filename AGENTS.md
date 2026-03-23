# Repository Guidelines

## Project Structure & Module Organization
- `index.html` houses the entire SPA (semantic HTML, inline navigation, and hero/section layout) plus the nav, sections, and scripts that drive the page.
- Styles live under `css/` (`css/main.css` plus component subfolders) mirroring the layout in `index.html`, while modular behaviors and data live in `js/` (`modules/`, `data/`).
- Images and static media sit in `assets/images/`; reference docs or maps go in `assets/docs/` and `estatistica/` for research materials.
- The Netlify config and helper functions in `.netlify/` exist solely for deployment; no build pipeline or backend code is required.

## Build, Test, and Development Commands
- `open index.html` launches the static site directly in the default browser for quick visual reviews.
- `python3 -m http.server 8000` serves the directory on `http://localhost:8000` so you can exercise scroll, navigation, and form behaviors in a real HTTP context.
- For CI or hosting you can drop `index.html` plus `assets/`, `css/`, and `js/` into any static host (GitHub Pages, Netlify, Cloudflare Pages) as described in the README.

## Coding Style & Naming Conventions
- Two-space indentation for HTML, CSS, and JavaScript; keep attribute ordering logical (ARIA/state, href/src, class).
- Class names follow BEM-like conventions used throughout `css/main.css` (e.g., `hero__content`, `nav__links`).
- Keep custom properties, colors, and breakpoint variables centralized in the stylesheet and reuse them rather than sprinkling magic values.

## Testing Guidelines
- No automated test suite exists; verify changes by refreshing `index.html` in the browser or via the local HTTP server and checking each anchor target and form.
- When altering scripts in `js/`, open the browser console to inspect for runtime errors and confirm Intersection Observer callbacks run as expected.

## Commit & Pull Request Guidelines
- Follow the descriptive tone already in history (e.g., `Observatório: actualizar dados para Idealista Dez 2025`), naming the area or feature first when useful.
- Pull requests should summarize the change, mention any relevant section IDs (`#projetos`, `#noticias`), and include before/after screenshots or links if the visual layout shifts.
