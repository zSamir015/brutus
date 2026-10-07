import { useEffect } from "react";
import { AppState } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { enforceExpiry, useAuth } from "@/store/authStore";

export default function RootLayout() {
  const { session, ready, init } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => init(), [init]);

  // Al volver a primer plano, revalida expiración de sesión
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => s === "active" && enforceExpiry());
    return () => sub.remove();
  }, []);

  // Guard de rutas: sin sesión → login
  useEffect(() => {
    if (!ready) return;
    const inAuth = segments[0] === "(auth)";
    if (!session && !inAuth) router.replace("/(auth)/login");
    if (session && inAuth) router.replace("/(app)");
  }, [session, ready, segments, router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Slot />
    </SafeAreaProvider>
  );
}
