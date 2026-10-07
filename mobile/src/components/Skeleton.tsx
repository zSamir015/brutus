import { useEffect } from "react";
import { AccessibilityInfo, StyleSheet, View, type DimensionValue } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";
import { border, colors, space } from "@/theme";

function Block({ width, height }: { width: DimensionValue; height: number }) {
  const o = useSharedValue(1);
  useEffect(() => {
    let off = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (off || reduce) return; // respeta "reducir movimiento"
      o.value = withRepeat(
        withSequence(withTiming(0.4, { duration: 700, easing: Easing.inOut(Easing.quad) }), withTiming(1, { duration: 700, easing: Easing.inOut(Easing.quad) })),
        -1,
      );
    });
    return () => { off = true; };
  }, [o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[styles.block, { width, height }, anim]} />;
}

export function TaskSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View accessible accessibilityRole="progressbar" accessibilityLabel="Cargando tareas" style={{ gap: space.md }}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={styles.row}>
          <Block width={28} height={28} />
          <Block width={i % 2 ? "55%" : "75%"} height={18} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: space.md, padding: space.md, borderWidth: border.width, borderColor: border.color, backgroundColor: colors.white },
  block: { backgroundColor: colors.ink + "26", borderWidth: border.thin, borderColor: border.color },
});
