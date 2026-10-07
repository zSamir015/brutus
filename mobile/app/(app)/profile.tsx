import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NBButton } from "@/components/NBButton";
import { NBCard } from "@/components/NBCard";
import { useAuth } from "@/store/authStore";
import { colors, font, space } from "@/theme";

export default function Profile() {
  const { session, signOut } = useAuth();
  const exp = session?.expires_at ? new Date(session.expires_at * 1000).toLocaleTimeString() : "—";
  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Text accessibilityRole="header" style={styles.title}>PERFIL</Text>
      <NBCard color={colors.green}>
        <Text style={styles.line}>{session?.user.email}</Text>
        <Text style={styles.sub}>SESIÓN EXPIRA {exp}</Text>
      </NBCard>
      <NBButton label="Cerrar sesión" onPress={signOut} color={colors.red} a11yHint="Termina la sesión y borra el token del dispositivo" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, padding: space.lg, gap: space.lg },
  title: { fontFamily: font.family, fontWeight: font.weight.black, fontSize: font.size.xl, color: colors.ink },
  line: { fontFamily: font.family, fontWeight: font.weight.black, fontSize: font.size.lg, color: colors.ink },
  sub: { fontFamily: font.family, fontWeight: font.weight.bold, fontSize: font.size.sm, color: colors.ink, marginTop: space.xs },
});
