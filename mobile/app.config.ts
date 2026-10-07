import type { ExpoConfig } from "expo/config";

// Solo variables EXPO_PUBLIC_* llegan al bundle del cliente.
// Nunca leer SERVICE_ROLE / claves privadas aquí: viven en Supabase secrets.
const config: ExpoConfig = {
  name: "NeoSecure",
  slug: "neo-brutal-secure-app",
  version: "1.0.0",
  scheme: "neosecure",
  orientation: "portrait",
  userInterfaceStyle: "light",
  newArchEnabled: true,
  ios: {
    bundleIdentifier: "com.example.neosecure",
    supportsTablet: false,
    infoPlist: { NSAppTransportSecurity: { NSAllowsArbitraryLoads: false } }, // fuerza TLS
  },
  android: {
    package: "com.example.neosecure",
    allowBackup: false, // evita extraer datos locales via adb backup
  },
  plugins: [
    "expo-router",
    "expo-secure-store",
    ["expo-build-properties", { android: { usesCleartextTraffic: false } }], // solo TLS
  ],
  experiments: { typedRoutes: true },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: { projectId: process.env.EAS_PROJECT_ID },
  },
};

export default config;
