# Security (static site + Supabase)

| # | Topic | Status |
|---|-------|--------|
| 1 | Zero exposure | Only the functions URL and the anon key reach the browser (`js/config.js`). `.env*` is ignored; `.env.example` documents what is public and what is private. The build (`scripts/build.sh`) publishes only `index.html`, `css/`, `js/` (no examples), `data/` and `assets/`. |
| 2 | Secret management | `js/config.js` (demo mode) is committed; on deploy the workflow overwrites it from GitHub Secrets. `SERVICE_ROLE_KEY` lives only in `supabase secrets`. |
| 3 | Storage | The page stores no tokens or sensitive data (not even in localStorage). |
| 4 | Input | Client: strips control characters and whitespace, regex check, 254-character limit, honeypot and mandatory consent. DOM built only with `textContent`. Server: Zod `.strict()` with a literal `consent: true`. |
| 5 | Auth | Not applicable: there is no login. |
| 6 | Server-side validation | The `subscribe` Edge Function re-validates everything; the client is never trusted. |
| 7 | Rate limiting | Client: 3 per minute (UX only). Server, in three layers: global 120/min, per IP 5/min and per email 3/min. If the RPC fails, the request is blocked. |
| 8 | Client IP | Uses the **last** `X-Forwarded-For` entry (the one appended by the proxy), not the first (which can be forged), or the header named in `TRUSTED_IP_HEADER`. **Verify after deploying** by sending a fake `X-Forwarded-For`: the per-IP limit must not change. The global limit still protects even if the IP is spoofed. |
| 9 | RLS | `subscribers` and `rate_limits`: RLS forced, no policies, privileges revoked from anon and authenticated. Only the service role writes. `pg_cron` purges `rate_limits` every 15 minutes. |
| 10 | CORS / TLS / CSP | CORS with an allowlist (`ALLOWED_ORIGINS`), never `*`. GitHub Pages serves HTTPS; the client rejects a non-HTTPS `functionsUrl`. CSP in a `<meta>` tag with no `unsafe-inline`. |
| 11 | Privacy | Explicit consent via a checkbox and a privacy notice; `consented_at` is stored. |

## Known limitations

- GitHub Pages does not allow custom HTTP headers, so `frame-ancestors` and HSTS cannot be set (the CSP lives in `<meta>`).
- There is no double opt-in. A real business should send a confirmation email before activating a subscription.

## Reporting a problem

If you find a security issue, please open an issue in this repository or contact the author through [GitHub](https://github.com/zSamir015).
