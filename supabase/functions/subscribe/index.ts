// Edge Function: server-side validation, layered rate limiting, restrictive CORS.
// Secrets (SERVICE_ROLE_KEY, ALLOWED_ORIGINS) come from `supabase secrets set`, never from the frontend.
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
  consent: z.literal(true), // explicit consent is required
}).strict();

const json = (data: unknown, status: number, origin: string | null, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors(origin), ...extra } });

/**
 * Client IP. A client can send its own X-Forwarded-For and proxies APPEND to the end,
 * so the first entry can be forged. We use the LAST one (added by the platform proxy),
 * or a configurable trusted header. Verify on your deployment by sending a fake header.
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
    return data === true; // if the RPC fails, block the request (fail closed)
  };
  const tooMany = () => json({ error: "rate_limited" }, 429, origin, { "Retry-After": "60" });

  // Layer 1: global limit (cannot be bypassed by changing IP). Layer 2: per IP.
  if (!(await limit("global:subscribe", 120))) return tooMany();
  if (!(await limit(`ip:${clientIp(req)}:subscribe`, 5))) return tooMany();

  let parsed;
  try { parsed = body.parse(await req.json()); } catch { return json({ error: "invalid" }, 400, origin); }

  // Layer 3: per email (stops the form from being used to flood one address).
  if (!(await limit(`email:${parsed.email}:subscribe`, 3))) return tooMany();

  // idempotent upsert: does not reveal whether the email already existed
  const { error } = await admin
    .from("subscribers")
    .upsert({ email: parsed.email, consented_at: new Date().toISOString() }, { onConflict: "email", ignoreDuplicates: true });
  if (error) return json({ error: "server" }, 500, origin);
  return json({ ok: true }, 201, origin);
});
