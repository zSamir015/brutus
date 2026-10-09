// Demo mode: no backend configured. The form validates but sends nothing.
// This file is committed on purpose: it is the default config for local development.
// On deploy, the GitHub Actions workflow overwrites it with the PUBLIC values
// from GitHub Secrets (if present). Never put the service_role key or any other secret here.
window.APP_CONFIG = { functionsUrl: "", anonKey: "" };
