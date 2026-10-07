// Copia a js/config.js (ignorado por git) o deja que el workflow de GitHub Actions lo genere.
// SOLO valores públicos: la anon key es pública por diseño (RLS protege los datos).
// NUNCA pongas aquí la service_role key ni otro secreto: todo lo de este archivo lo ve cualquier visitante.
window.APP_CONFIG = {
  functionsUrl: "https://TU-PROYECTO.supabase.co/functions/v1",
  anonKey: "TU_ANON_KEY_PUBLICA",
};
