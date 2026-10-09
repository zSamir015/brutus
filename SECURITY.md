# Seguridad (sitio estático + Supabase)

| # | Punto | Estado |
|---|-------|--------|
| 1 | Exposición cero | Al navegador solo llegan la URL de funciones y la anon key (`js/config.js`). `.env*` está ignorado; `.env.example` documenta qué es público y qué privado. El build (`scripts/build.sh`) publica solo `index.html`, `css/`, `js/` (sin ejemplos), `data/` y `assets/`. |
| 2 | Gestión de secretos | `js/config.js` (modo demo) está versionado; al desplegar, el workflow lo sobrescribe desde GitHub Secrets. `SERVICE_ROLE_KEY` vive solo en `supabase secrets`. |
| 3 | Almacenamiento | La página no guarda tokens ni datos sensibles (ni en localStorage). |
| 4 | Entrada | Cliente: limpia caracteres de control y espacios, regex, máximo 254, honeypot y consentimiento obligatorio. DOM solo con `textContent`. Servidor: Zod `.strict()` con `consent: true` literal. |
| 5 | Auth | No aplica: no hay login. |
| 6 | Validación en servidor | La Edge Function `subscribe` revalida todo; el cliente nunca es de confianza. |
| 7 | Rate limiting | Cliente: 3/min (solo UX). Servidor, en tres capas: global 120/min, por IP 5/min y por correo 3/min. Si la RPC falla, se bloquea. |
| 8 | IP del cliente | Se usa la **última** entrada de `X-Forwarded-For` (la que añade el proxy), no la primera (falsificable), o la cabecera de `TRUSTED_IP_HEADER`. **Verifícalo tras desplegar** enviando un `X-Forwarded-For` falso: el límite por IP no debe cambiar. El límite global protege aunque la IP se falsifique. |
| 9 | RLS | `subscribers` y `rate_limits`: RLS forzado, sin políticas, permisos revocados a anon y authenticated. Solo el service role escribe. `pg_cron` purga `rate_limits` cada 15 min. |
| 10 | CORS / TLS / CSP | CORS con lista de orígenes (`ALLOWED_ORIGINS`), nunca `*`. GitHub Pages sirve HTTPS; el cliente rechaza un `functionsUrl` sin HTTPS. CSP en `<meta>` sin `unsafe-inline`. |
| 11 | Privacidad | Consentimiento explícito con casilla y aviso de privacidad; se guarda `consented_at`. |

## Limitaciones conocidas

- GitHub Pages no permite cabeceras HTTP: `frame-ancestors` y HSTS no se pueden fijar (la CSP va en `<meta>`).
- No hay doble opt-in. Para un negocio real, conviene enviar un correo de confirmación antes de activar la suscripción.
