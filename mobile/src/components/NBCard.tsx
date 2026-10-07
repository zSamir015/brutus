import { StyleSheet, View, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { border, colors, shadow, space } from "@/theme";

export function NBCard({ children, color = colors.white, style }: { children: ReactNode; color?: string; style?: ViewStyle }) {
  return (
    <View style={styles.shadow}>
      <View style={[styles.card, { backgroundColor: color }, style]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: { backgroundColor: shadow.color, marginRight: shadow.offset, marginBottom: shadow.offset },
  card: {
    borderWidth: border.width,
    borderColor: border.color,
    padding: space.md,
    transform: [{ translateX: -shadow.offset }, { translateY: -shadow.offset }],
  },
});
