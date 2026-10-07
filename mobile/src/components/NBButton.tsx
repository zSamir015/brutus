import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { border, colors, font, shadow, space, touch } from "@/theme";

type Props = {
  label: string;
  onPress: () => void;
  color?: string;
  disabled?: boolean;
  a11yHint?: string;
  style?: ViewStyle;
};

export function NBButton({ label, onPress, color = colors.yellow, disabled, a11yHint, style }: Props) {
  return (
    <View style={[styles.wrap, style]}>
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={a11yHint}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={onPress}
        hitSlop={4}
        style={({ pressed }) => [
          styles.btn,
          { backgroundColor: disabled ? colors.muted : color },
          pressed && { transform: [{ translateX: 0 }, { translateY: 0 }] }, // "hunde" el botón sobre su sombra
        ]}
      >
        <Text style={styles.text}>{label.toUpperCase()}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: shadow.color, marginRight: shadow.offset, marginBottom: shadow.offset },
  btn: {
    minHeight: touch.min,
    minWidth: touch.min,
    paddingHorizontal: space.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: border.width,
    borderColor: border.color,
    transform: [{ translateX: -shadow.offset }, { translateY: -shadow.offset }],
  },
  text: { fontFamily: font.family, fontWeight: font.weight.black, fontSize: font.size.md, color: colors.ink },
});
