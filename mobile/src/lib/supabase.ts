import "react-native-url-polyfill/auto";
import Constants from "expo-constants";
import { createClient } from "@supabase/supabase-js";
import { secureStorage } from "./secureStorage";

const { supabaseUrl, supabaseAnonKey } = Constants.expoConfig?.extra ?? {};

if (!supabaseUrl || !supabaseAnonKey) throw new Error("Falta EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY");
// TLS obligatorio: rechaza http:// en build de producción
if (!__DEV__ && !String(supabaseUrl).startsWith("https://")) throw new Error("Supabase URL debe ser HTTPS");

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: secureStorage, // tokens en Keychain/Keystore, nunca AsyncStorage
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
