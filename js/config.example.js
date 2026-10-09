// Example config with a backend. To test locally, copy these values into js/config.js
// WITHOUT committing them (or use GitHub Secrets and let the workflow generate the file on deploy).
// PUBLIC values only: the anon key is public by design (RLS protects the data).
// NEVER put the service_role key or any other secret here: every visitor can read this file.
window.APP_CONFIG = {
  functionsUrl: "https://TU-PROYECTO.supabase.co/functions/v1",
  anonKey: "TU_ANON_KEY_PUBLICA",
};
