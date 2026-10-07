# Seguridad (sitio estático + Supabase)

| # | Punto | Estado |
|---|-------|--------|
| 1 | Env / exposición cero | Al navegador solo llegan URL y anon key (`js/config.js`). `.env*` ignorado; `.env.example` documenta qué es público/privado. |
| 2 | Gestión de secretos | `js/config.js` lo genera `.github/workflows/pages.yml` desde GitHub Secrets. `SERVICE_ROLE_KEY` solo en `supabase secrets`. |
| 3 | Almacenamiento seguro | La página no guarda tokens ni datos sensibles (ni localStorage). Si se añade login: cookies `HttpOnly; Secure; SameSite`, no localStorage. |
| 4 | Input sanity | Cliente: limpia control/espacios, regex, máx 254, honeypot. DOM solo con `textContent` (sin `innerHTML`). Servidor: Zod `.strict()`. |
| 5 | Auth con expiración | **No aplica**: la landing no tiene login. Con Supabase Auth, definir JWT expiry en el dashboard. |
| 6 | Validación servidor | Edge Function `subscribe` revalida todo; el cliente nunca es de confianza. |
| 7 | Rate limiting | Cliente: 3/min (solo UX). Servidor: `check_rate_limit`. |
| 8 | IP limiting | 5 altas/min por IP (`x-forwarded-for`) → 429 + `Retry-After`. |
| 9 | RLS | `subscribers` y `rate_limits`: RLS forzado, sin policies, permisos revocados a anon/authenticated. Solo service role escribe. |
| 10 | CORS / TLS | CORS con allowlist (`ALLOWED_ORIGINS`), nunca `*`. GitHub Pages sirve HTTPS; el cliente rechaza `functionsUrl` no-HTTPS. CSP restrictiva por `<meta>`. |

## Despliegue backend
```
supabase db push
supabase secrets set SERVICE_ROLE_KEY=... ALLOWED_ORIGINS=https://zsamir015.github.io
supabase functions deploy subscribe
```
Luego añade `SUPABASE_FUNCTIONS_URL` y `SUPABASE_ANON_KEY` en GitHub Secrets y, en Settings → Pages, cambia Source a **GitHub Actions**.

Limitaciones: GitHub Pages no permite cabeceras HTTP, así que `frame-ancestors` y HSTS no se pueden fijar (la CSP va en `<meta>`).
