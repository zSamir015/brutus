import { useEffect, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ZodError } from "zod";
import { NBButton } from "@/components/NBButton";
import { NBCard } from "@/components/NBCard";
import { NBInput } from "@/components/NBInput";
import { TaskSkeleton } from "@/components/Skeleton";
import { useTasks } from "@/store/tasksStore";
import { border, colors, font, space, touch } from "@/theme";

export default function Tasks() {
  const { items, status, error, load, add, toggle } = useTasks();
  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState<string>();
  const [busy, setBusy] = useState(false);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    setBusy(true);
    setFormError(undefined);
    try {
      await add(title);
      setTitle("");
    } catch (e) {
      setFormError(e instanceof ZodError ? e.issues[0].message : (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <Text accessibilityRole="header" style={styles.title}>TAREAS</Text>

      <NBCard color={colors.yellow}>
        <View style={{ gap: space.md }}>
          <NBInput label="Nueva" value={title} onChangeText={setTitle} maxLength={80} error={formError} returnKeyType="done" onSubmitEditing={submit} />
          <NBButton label="Añadir" onPress={submit} disabled={busy || !title.trim()} color={colors.pink} />
        </View>
      </NBCard>

      <View style={styles.list}>
        {status === "loading" ? (
          <TaskSkeleton />
        ) : status === "error" ? (
          <NBCard color={colors.red}>
            <Text accessibilityRole="alert" style={styles.errText}>{error}</Text>
            <NBButton label="Reintentar" onPress={load} color={colors.white} style={{ marginTop: space.md }} />
          </NBCard>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(t) => t.id}
            contentContainerStyle={{ gap: space.md, paddingBottom: space.xl }}
            ListEmptyComponent={<Text style={styles.empty}>SIN TAREAS</Text>}
            renderItem={({ item }) => (
              <Pressable
                accessible
                accessibilityRole="checkbox"
                accessibilityLabel={item.title}
                accessibilityState={{ checked: item.done }}
                onPress={() => toggle(item.id)}
                style={styles.row}
              >
                <View style={[styles.box, item.done && { backgroundColor: colors.green }]}>
                  {item.done && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={[styles.rowText, item.done && styles.done]} numberOfLines={2}>{item.title}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper, padding: space.lg, gap: space.lg },
  title: { fontFamily: font.family, fontWeight: font.weight.black, fontSize: font.size.xl, color: colors.ink },
  list: { flex: 1 },
  row: { flexDirection: "row", alignItems: "center", gap: space.md, minHeight: touch.min, padding: space.md, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white },
  box: { width: 28, height: 28, borderWidth: border.width, borderColor: border.color, alignItems: "center", justifyContent: "center" },
  check: { fontWeight: font.weight.black, color: colors.ink },
  rowText: { flex: 1, fontFamily: font.family, fontWeight: font.weight.bold, fontSize: font.size.md, color: colors.ink },
  done: { textDecorationLine: "line-through", color: colors.muted },
  empty: { fontFamily: font.family, fontWeight: font.weight.black, color: colors.muted, textAlign: "center", marginTop: space.xl },
  errText: { fontFamily: font.family, fontWeight: font.weight.black, color: colors.white },
});
