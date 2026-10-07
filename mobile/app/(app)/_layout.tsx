import { Tabs } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { border, colors, font, space, touch } from "@/theme";

const TABS: Record<string, { label: string; color: string }> = {
  index: { label: "Tareas", color: colors.blue },
  profile: { label: "Perfil", color: colors.green },
};

// Tab bar neo-brutalista propia: borde grueso, bloque activo de color, objetivos ≥44dp
function NBTabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: bottom }]} accessibilityRole="tablist">
      {state.routes.map((route, i) => {
        const cfg = TABS[route.name];
        if (!cfg) return null;
        const focused = state.index === i;
        return (
          <Pressable
            key={route.key}
            accessible
            accessibilityRole="tab"
            accessibilityLabel={cfg.label}
            accessibilityState={{ selected: focused }}
            onPress={() => navigation.navigate(route.name)}
            style={[styles.tab, focused && { backgroundColor: cfg.color }]}
          >
            <Text style={[styles.tabText, focused && { color: colors.white }]}>{cfg.label.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AppLayout() {
  return <Tabs tabBar={(p) => <NBTabBar {...p} />} screenOptions={{ headerShown: false }} />;
}

const styles = StyleSheet.create({
  bar: { flexDirection: "row", backgroundColor: colors.white, borderTopWidth: border.width, borderColor: border.color },
  tab: { flex: 1, minHeight: touch.min + space.md, alignItems: "center", justifyContent: "center", borderRightWidth: border.thin, borderColor: border.color },
  tabText: { fontFamily: font.family, fontWeight: font.weight.black, fontSize: font.size.md, color: colors.ink },
});
