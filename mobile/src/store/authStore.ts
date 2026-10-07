import { create } from "zustand";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { loginSchema } from "@/lib/validation";
import { createLimiter } from "@/lib/rateLimit";

const loginLimit = createLimiter(5, 60_000);

type AuthState = {
  session: Session | null;
  ready: boolean;
  init: () => () => void;
  signIn: (raw: unknown) => Promise<void>;
  signOut: () => Promise<void>;
};

const isExpired = (s: Session | null) => !s || (s.expires_at ?? 0) * 1000 <= Date.now();

export const useAuth = create<AuthState>((set) => ({
  session: null,
  ready: false,

  init() {
    supabase.auth.getSession().then(({ data }) => {
      // Sesión expirada y sin refresh posible → se descarta
      set({ session: isExpired(data.session) ? null : data.session, ready: true });
    });
    const { data } = supabase.auth.onAuthStateChange((_e, session) => set({ session, ready: true }));
    return () => data.subscription.unsubscribe();
  },

  async signIn(raw) {
    if (!loginLimit()) throw new Error("Demasiados intentos. Espera 1 min.");
    const { email, password } = loginSchema.parse(raw);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Credenciales inválidas"); // mensaje genérico: no revela si el email existe
  },

  async signOut() {
    await supabase.auth.signOut(); // limpia SecureStore vía storage adapter
    set({ session: null });
  },
}));

// Re-chequea expiración al volver a primer plano (ver app/_layout.tsx)
export const enforceExpiry = async () => {
  const s = useAuth.getState().session;
  if (s && isExpired(s)) {
    const { error } = await supabase.auth.refreshSession();
    if (error) await useAuth.getState().signOut();
  }
};
