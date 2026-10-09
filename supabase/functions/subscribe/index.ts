// Edge Function: validación server-side, rate limit en capas, CORS restrictivo.
// Secretos (SERVICE_ROLE_KEY, ALLOWED_ORIGINS) vienen de `supabase secrets set`, nunca del frontend.
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const cors = (origin: string | null) => ({
  ...(origin && allowed.includes(origin) ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const body = z.object({
  email: z.string().max(254).transform((s) => s.trim().toLowerCase()).pipe(z.string().email()),
  consent: z.literal(true), // consentimiento explícito obligatorio
}).strict();

const json = (data: unknown, status: number, origin: string | null, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors(origin), ...extra } });

/**
 * IP del cliente. El cliente puede enviar su propio X-Forwarded-For y los proxies AÑADEN al final,
 * así que la primera entrada es falsificable. Se usa la ÚLTIMA (la que agrega el proxy de la plataforma),
 * o una cabecera de confianza configurable. Verifica en tu despliegue enviando una cabecera falsa.
 */
function clientIp(req: Request): string {
  const trusted = Deno.env.get("TRUSTED_IP_HEADER");
  if (trusted) return req.headers.get(trusted)?.trim() || "unknown";
  const hops = (req.headers.get("x-forwarded-for") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  return hops.at(-1) ?? "unknown";
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method" }, 405, origin);
  if (!origin || !allowed.includes(origin)) return json({ error: "origin" }, 403, origin);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SERVICE_ROLE_KEY")!);
  const limit = async (key: string, max: number) => {
    const { data } = await admin.rpc("check_rate_limit", { p_key: key, p_max: max, p_window_seconds: 60 });
    return data === true; // si la RPC falla, se bloquea (fail closed)
  };
  const tooMany = () => json({ error: "rate_limited" }, 429, origin, { "Retry-After": "60" });

  // Capa 1: límite global (no se puede evadir cambiando de IP). Capa 2: por IP.
  if (!(await limit("global:subscribe", 120))) return tooMany();
  if (!(await limit(`ip:${clientIp(req)}:subscribe`, 5))) return tooMany();

  let parsed;
  try { parsed = body.parse(await req.json()); } catch { return json({ error: "invalid" }, 400, origin); }

  // Capa 3: por correo (evita usar el formulario para inundar una misma dirección).
  if (!(await limit(`email:${parsed.email}:subscribe`, 3))) return tooMany();

  // upsert idempotente: no revela si el correo ya existía
  const { error } = await admin
    .from("subscribers")
    .upsert({ email: parsed.email, consented_at: new Date().toISOString() }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return json({ error: "server" }, 500, origin);
  return json({ ok: true }, 201, origin);
});
