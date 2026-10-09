# Brutus Burgers 🍔

🌐 **English** · [Español](README.es.md)

[![Deploy](https://github.com/zSamir015/brutus/actions/workflows/pages.yml/badge.svg)](https://github.com/zSamir015/brutus/actions/workflows/pages.yml)
[![Lighthouse](https://github.com/zSamir015/brutus/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/zSamir015/brutus/actions/workflows/lighthouse.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**[See the live demo →](https://zsamir015.github.io/brutus/)**

A neo-brutalist landing page for a **fictional** burger joint in Costa del Este, Panama. Portfolio project: vanilla HTML, CSS and JavaScript on the frontend, plus an optional Supabase backend for the "Club Brutus" newsletter signup. The site itself is in Spanish, since the business is set in Panama.

![Demo: the burger assembles, the menu filters, opening hours and signup](docs/media/demo.gif)

## What this project shows

- **Framework-free frontend**: semantic HTML, CSS driven by design tokens, and JavaScript modules with no build step.
- **Real accessibility**: keyboard navigation, ARIA, reduced motion, and contrast checked by Lighthouse.
- **End-to-end security**: a strict CSP on the client; RLS, validation and rate limiting on the server.
- **Automated quality**: unit tests, Lighthouse in CI, and continuous deployment to GitHub Pages.

| Desktop | Mobile |
|---|---|
| ![Desktop view](docs/media/desktop.png) | ![Mobile view](docs/media/mobile.png) |

## Features

- **Neo-brutalist design**: 3 px borders, hard shadows with no blur, and an SVG burger that assembles layer by layer.
- **Filterable menu** by category, with a hand-made SVG illustration per dish, a highlighted favorite and tags (spicy, veggie).
- **Live opening hours**: "Open now / Closed" computed in the restaurant's time zone, not the visitor's.
- **Illustrated location**: storefront and a fictional map of Costa del Este (Av. Paseo del Mar, Corredor Sur, Bay of Panama).
- **Skeleton loaders** while content loads, and sections that reveal on scroll.
- **Club Brutus**: signup form with validation, explicit consent, an anti-bot honeypot and a UX throttle.
- **Accessible**: skip link, ARIA, touch targets of at least 44 px, `aria-live` announcements and `prefers-reduced-motion` support.
- **Secure**: strict CSP with no `unsafe-inline`, DOM built only with `textContent`, and no secrets in the frontend.
- **Animated UI details**: announcement ticker, glare sweeping across buttons, wiggling icons, cards that lift and press, an animated checkbox, and engravings that straighten on hover.
- **The legend**: humorous ancient-Rome engravings by John Leech (c. 1850, public domain) on a paper background.

## Stack

| Layer | Technology |
|---|---|
| Frontend | HTML, CSS (design tokens), JavaScript ES modules, no build or dependencies |
| Backend (optional) | Supabase: Postgres with RLS + a Deno Edge Function with Zod |
| Quality | Tests with `node --test`, Lighthouse CI (accessibility ≥ 95) |
| Deployment | GitHub Actions → GitHub Pages |

## Structure

```
index.html
css/tokens.css          Single source of design: colors, spacing, typography, motion
css/styles.css          Styles; they only consume tokens
js/app.js               Menu, content rendering, filter, opening hours, form
js/art.js               SVG dish illustrations (createElementNS, CSP-safe)
js/validate.js          Form validation (pure, tested)
js/hours.js             "Open / closed" logic (pure, tested)
js/config.js            Demo mode; the workflow overwrites it on deploy
data/content.json       Menu, reviews, location and opening hours
supabase/               SQL migrations and the `subscribe` Edge Function
scripts/build.sh        Copies only the public files into _site/
```

## Run locally

```bash
npm run dev      # python3 -m http.server 8000 (fetch and modules do not work from file://)
npm test         # validation and opening-hours tests
npm run build    # builds _site/ exactly like production
```

## Technical decisions

- **No frameworks, no build.** The page weighs a few KB and loads with no extra steps.
- **Content in JSON.** Changing the menu or the hours does not require touching HTML.
- **Hours use the restaurant's time zone** (`America/Panama`, via `Intl.DateTimeFormat`), so a visitor abroad sees the correct status.
- **The server never trusts the client.** The Edge Function re-validates with Zod, requires consent, and applies rate limiting in three layers (global, per IP and per email).
- **RLS with no policies.** The tables are unreachable with the anon key; only the Edge Function (service role) writes.

Details and checklist in [SECURITY.md](SECURITY.md).

## Backend (optional)

Without a backend the form runs in **demo mode**: it validates but stores nothing. To enable it:

```bash
supabase db push
supabase secrets set SERVICE_ROLE_KEY=... ALLOWED_ORIGINS=https://zsamir015.github.io
supabase functions deploy subscribe
```

Then add `SUPABASE_FUNCTIONS_URL` and `SUPABASE_ANON_KEY` under GitHub → Settings → Secrets and variables → Actions. The workflow writes those public values into `js/config.js` on deploy.

## Credits

- UI animations adapted from [Uiverse.io](https://uiverse.io/) (author: 0xnihilism, MIT license).
- Illustrations by John Leech, *The Comic History of Rome* (c. 1850), public domain via the [Public Domain Image Archive](https://pdimagearchive.org/).
- Paper texture derived from [Texture Labs](https://texturelabs.org/).
- Design inspiration: neo-brutalism galleries on [Dribbble](https://dribbble.com/search/neo-brutalism-food) (reference only; no design was copied).

Details and licenses in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

The code is [MIT](LICENSE) © 2026 Samir Lorenzo. Third-party assets keep their own licenses (see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)); in particular, `assets/paper-grain.jpg` is **not** under MIT.

*Brutus Burgers is a fictional business created for this portfolio.*
