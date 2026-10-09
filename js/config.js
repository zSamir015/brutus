// Modo demo: sin backend configurado. El formulario valida, pero no envía nada.
// Este archivo sí está versionado: es la configuración por defecto para desarrollo local.
// Al desplegar, el workflow de GitHub Actions lo sobrescribe con los valores PÚBLICOS
// de GitHub Secrets (si existen). Nunca pongas aquí la service_role key ni otro secreto.
window.APP_CONFIG = { functionsUrl: "", anonKey: "" };
