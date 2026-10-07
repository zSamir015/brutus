import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { border, colors, font, space, touch } from "@/theme";

type Props = TextInputProps & { label: string; error?: string };

export function NBInput({ label, error, ...rest }: Props) {
  return (
    <View style={{ gap: space.xs }}>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      <TextInput
        accessible
        accessibilityLabel={label}
        accessibilityHint={error}
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, !!error && { borderColor: colors.red }]}
        {...rest}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: font.family, fontWeight: font.weight.black, fontSize: font.size.sm, color: colors.ink },
  input: {
    minHeight: touch.min,
    borderWidth: border.width,
    borderColor: border.color,
    backgroundColor: colors.white,
    paddingHorizontal: space.md,
    fontFamily: font.family,
    fontSize: font.size.md,
    color: colors.ink,
  },
  error: { fontFamily: font.family, fontWeight: font.weight.bold, fontSize: font.size.sm, color: colors.red },
});
