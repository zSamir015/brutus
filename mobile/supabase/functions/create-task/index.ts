// Edge Function: validación server-side, rate limit por usuario + por IP, CORS restrictivo.
// Secretos (SERVICE_ROLE_KEY, ALLOWED_ORIGINS) vienen de `supabase secrets set`, nunca del cliente.
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const allowed = (Deno.env.get("ALLOWED_ORIGINS") ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const cors = (origin: string | null) => ({
  // Apps nativas no envían Origin; solo se refleja un origin en la allowlist (nunca "*")
  ...(origin && allowed.includes(origin) ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}),
  "Access-Control-Allow-Headers": "authorization, content-type, apikey",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});

const body = z.object({
  title: z.string().max(200).transform((s) => s.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim())
    .pipe(z.string().min(1).max(80).regex(/^[^<>{}$`\\]*$/)),
}).strict();

const json = (data: unknown, status: number, origin: string | null, extra: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors(origin), ...extra } });

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method" }, 405, origin);
  if (origin && !allowed.includes(origin)) return json({ error: "origin" }, 403, origin);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SERVICE_ROLE_KEY")!);

  // 1. Autenticación: verifica el JWT contra Supabase Auth (no confía en claims del cliente)
  const jwt = (req.headers.get("authorization") ?? "").replace(/^Bearer /i, "");
  const { data: auth, error: authErr } = await admin.auth.getUser(jwt);
  if (authErr || !auth.user) return json({ error: "unauthorized" }, 401, origin);
  const uid = auth.user.id;

  // 2. IP limiting (30/min por IP) y rate limit por usuario (10/min)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const [ipOk, userOk] = await Promise.all([
    admin.rpc("check_rate_limit", { p_key: `ip:${ip}`, p_max: 30, p_window_seconds: 60 }),
    admin.rpc("check_rate_limit", { p_key: `user:${uid}:create-task`, p_max: 10, p_window_seconds: 60 }),
  ]);
  if (ipOk.data !== true || userOk.data !== true) return json({ error: "rate_limited" }, 429, origin, { "Retry-After": "60" });

  // 3. Validación server-side (el cliente puede estar comprometido)
  let parsed;
  try { parsed = body.parse(await req.json()); } catch { return json({ error: "invalid" }, 400, origin); }

  // 4. Cuota de negocio: máx. 200 tareas por usuario
  const { count } = await admin.from("tasks").select("id", { count: "exact", head: true }).eq("user_id", uid);
  if ((count ?? 0) >= 200) return json({ error: "quota" }, 403, origin);

  // 5. Insert con user_id tomado del JWT verificado, jamás del body
  const { data, error } = await admin.from("tasks").insert({ user_id: uid, title: parsed.title }).select("id,title,done,created_at").single();
  if (error) return json({ error: "server" }, 500, origin);
  return json(data, 201, origin);
});
