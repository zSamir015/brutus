# Resumen de seguridad móvil

## Tokens en `expo-secure-store`
- `src/lib/secureStorage.ts` es el `storage` de Supabase Auth: access/refresh token van a **Keychain (iOS)** y **Keystore (Android)**, cifrados por el SO. AsyncStorage no se usa.
- `WHEN_UNLOCKED_THIS_DEVICE_ONLY`: solo legible con dispositivo desbloqueado, excluido de backups/iCloud y no migra a otro dispositivo.
- Se trocea en bloques de 1800 chars por el límite ~2KB de SecureStore en Android.
- `android.allowBackup=false` evita extraer datos con `adb backup`.
- Logout: `supabase.auth.signOut()` → borra todos los bloques. Expiración: `autoRefreshToken` + chequeo al volver a foreground (`enforceExpiry`); refresh fallido ⇒ logout. Duración del JWT: Supabase Dashboard → Auth → JWT expiry (recomendado 3600s).

## Cero fuga de llaves privadas en el build
- Solo `EXPO_PUBLIC_*` se inlinea en el bundle JS. Ahí van **únicamente** URL y anon key (públicas por diseño, protegidas por RLS).
- `app.config.ts` solo lee esas dos variables; `SERVICE_ROLE_KEY` no se referencia en ningún archivo bajo `app/` ni `src/`.
- `.env*` ignorado por git; solo `.env.example` (sin valores) se versiona.
- Secretos de build → `eas secret:create` / GitHub Actions secrets. Secretos de servidor → `supabase secrets set`.
- Regla: todo lo del bundle es público (se extrae con `strings`/descompilación). Si una clave es dañina en manos ajenas, va a una Edge Function.

## Checklist de los 10 puntos
| # | Dónde |
|---|-------|
| 1 Env | `.env.example`, `app.config.ts` |
| 2 Secretos | EAS Secrets, `supabase secrets` |
| 3 Cifrado local | `secureStorage.ts` |
| 4 Input sanity | `validation.ts` (Zod) |
| 5 Sesión | `authStore.ts`, `_layout.tsx` |
| 6 Validación servidor | `functions/create-task` |
| 7 Rate limit | cliente `rateLimit.ts` (UX) + `check_rate_limit` (real) |
| 8 IP limit | key `ip:<x-forwarded-for>` en Edge Function |
| 9 RLS | `migrations/001_*.sql` (`force row level security`, INSERT revocado) |
| 10 TLS/CORS | `usesCleartextTraffic=false`, ATS, check HTTPS, allowlist de origins |

## Despliegue
```
supabase db push
supabase secrets set SERVICE_ROLE_KEY=... ALLOWED_ORIGINS=https://app.tudominio.com
supabase functions deploy create-task
```
Limitación conocida: cert pinning no incluido (requiere build nativo/dev client).
