import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ZodError } from "zod";
import { NBButton } from "@/components/NBButton";
import { NBCard } from "@/components/NBCard";
import { NBInput } from "@/components/NBInput";
import { useAuth } from "@/store/authStore";
import { colors, font, space } from "@/theme";

export default function Login() {
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setErrors({});
    try {
      await signIn({ email, password });
    } catch (e) {
      if (e instanceof ZodError) {
        setErrors(Object.fromEntries(e.issues.map((i) => [String(i.path[0]), i.message])));
      } else {
        setErrors({ form: (e as Error).message });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.body}>
        <Text accessibilityRole="header" style={styles.title}>NEO{"\n"}SECURE</Text>
        <NBCard>
          <View style={{ gap: space.md }}>
            <NBInput label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" textContentType="username" autoComplete="email" error={errors.email} />
            <NBInput label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry textContentType="password" autoComplete="current-password" error={errors.password} />
            {!!errors.form && <Text accessibilityRole="alert" style={styles.error}>{errors.form}</Text>}
            <NBButton label={busy ? "Entrando…" : "Entrar"} onPress={submit} disabled={busy} color={colors.pink} />
          </View>
        </NBCard>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.yellow },
  body: { flex: 1, justifyContent: "center", padding: space.lg, gap: space.xl },
  title: { fontFamily: font.family, fontWeight: font.weight.black, fontSize: 56, lineHeight: 56, color: colors.ink },
  error: { fontFamily: font.family, fontWeight: font.weight.bold, color: colors.red },
});
