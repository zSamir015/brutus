// Edge Function: validación server-side, rate limit por IP, CORS restrictivo.
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
}).strict();

const json = (data: unknown, status: number, origin: string | null, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors(origin), ...extra } });

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method" }, 405, origin);
  if (!origin || !allowed.includes(origin)) return json({ error: "origin" }, 403, origin);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SERVICE_ROLE_KEY")!);

  // IP limiting: 5 altas/min por IP
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const { data: ok } = await admin.rpc("check_rate_limit", { p_key: `ip:${ip}:subscribe`, p_max: 5, p_window_seconds: 60 });
  if (ok !== true) return json({ error: "rate_limited" }, 429, origin, { "Retry-After": "60" });

  let parsed;
  try { parsed = body.parse(await req.json()); } catch { return json({ error: "invalid" }, 400, origin); }

  // upsert idempotente: no revela si el correo ya existía
  const { error } = await admin.from("subscribers").upsert({ email: parsed.email }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return json({ error: "server" }, 500, origin);
  return json({ ok: true }, 201, origin);
});
