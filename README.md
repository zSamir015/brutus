# Landing neo-brutalista

HTML + CSS + JS vanilla. Estética neo-brutalista (bordes 3px, sombras sólidas), menú responsive, skeleton loaders y accesibilidad (skip link, ARIA, objetivos ≥44px, `prefers-reduced-motion`).

- `css/tokens.css` — único archivo de tokens de diseño
- `css/styles.css` — estilos (solo consumen tokens)
- `js/app.js` — menú, carga de contenido con skeletons, formulario validado
- `data/content.json` — contenido
- `supabase/` — migración RLS + Edge Function `subscribe`
- `SECURITY.md` — checklist de seguridad y despliegue

Probar en local (el `fetch` necesita servidor, no `file://`):
```
python3 -m http.server 8000
```
Demo: https://zsamir015.github.io/responsive-landing-page/
