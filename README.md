# ORNÉ — Fine Jewelry Landing Page

A concept e-commerce landing page for **ORNÉ**, a fictional small-batch fine jewelry atelier. Built as a front-end showcase piece — full-bleed editorial hero, a light/dark theme system with a gradual crossfade transition, an ambient sparkle canvas, and a jeweler's-loupe photo magnifier on every product image.



---

## Features

- **Light / dark theme toggle** — a single accent-gold palette shared across both themes, with every color, border, and shadow crossfading smoothly (no instant snap) via CSS custom properties and transitions.
- **Photo magnifier ("loupe")** — hover any product photo or the atelier image to reveal a circular zoomed lens that tracks the cursor, built with vanilla JS and `background-position` math (no libraries).
- **Full-bleed photo hero** — a real editorial photograph with a scrim overlay and a nav bar that's transparent over the hero and fades to a blurred, opaque bar once scrolled.
- **Ambient sparkle field** — a lightweight `<canvas>` particle system with a dedicated accent color per theme, tuned so it reads clearly against both light and dark backgrounds.
- **Scroll-reveal animations** — sections fade/slide into view on scroll via `IntersectionObserver`.
- **Fully responsive** — breakpoints for tablet and mobile, with the nav, product grid, and craft section reflowing accordingly.
- **Accessible by default** — visible focus states, `aria-label`/`role="switch"` on the theme toggle, `prefers-reduced-motion` support that shortens/removes animation.

## Tech Stack

- **HTML5** — semantic markup, no build step required
- **CSS3** — custom properties (design tokens) for theming, CSS Grid & Flexbox for layout, `clamp()` for fluid type, native scroll-snap for the product carousel
- **Vanilla JavaScript (ES6+)** — no frameworks or dependencies; theme toggling, the loupe magnifier, the sparkle canvas, and scroll reveals are all hand-rolled
- **Canvas API** — powers the ambient sparkle background
- **IntersectionObserver API** — powers scroll-triggered reveal animations
- **Google Fonts** — [Fraunces](https://fonts.google.com/specimen/Fraunces) (display serif) + [Inter](https://fonts.google.com/specimen/Inter) (body/UI)

No package manager, bundler, or framework — open `index.html` and it runs.

## Project Structure

```
orne-jewelry-site/
├── index.html          # markup
├── styles.css           # all styling + theme tokens
├── script.js             # theme toggle, loupe magnifier, sparkle canvas, scroll reveals
└── assets/
    ├── hero.png          # hero photo
    ├── ring.jpg
    ├── necklace.jpg
    ├── earrings.jpg
    ├── braclet.jpg
    └── craft.jpg         # atelier/process photo
```

## Getting Started

No build tools needed.

```bash
git clone https://github.com/your-username/orne-jewelry-site.git
cd orne-jewelry-site
```

Then just open `index.html` in a browser, or serve it locally:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Visit `http://localhost:8000`.

## Customization

- **Swap images**: replace any file in `assets/` (keep the same filename, or update the matching `url(...)` / `data-loupe-photo` reference in `index.html` and `styles.css`).
- **Theme colors**: edit the CSS custom properties at the top of `styles.css` under `:root` (light theme) and `:root[data-theme="dark"]` (dark theme).
- **Sparkle color/intensity**: `--sparkle-color` and `--sparkle-opacity` per theme, also in `:root`.

## License

Concept project for portfolio use. Product photography should be replaced with licensed or original images before any commercial use.
