// Ejemplo de configuración con backend. Para probar en local, copia estos valores a js/config.js
// SIN hacer commit de ellos (o usa GitHub Secrets y deja que el workflow genere el archivo al desplegar).
// SOLO valores públicos: la anon key es pública por diseño (RLS protege los datos).
// NUNCA pongas aquí la service_role key ni otro secreto: todo lo de este archivo lo ve cualquier visitante.
window.APP_CONFIG = {
  functionsUrl: "https://TU-PROYECTO.supabase.co/functions/v1",
  anonKey: "TU_ANON_KEY_PUBLICA",
};
