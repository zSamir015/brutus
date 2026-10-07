import { Platform } from "react-native";

// Único origen de verdad visual. Ningún componente define colores/bordes/espaciado propios.
export const colors = {
  ink: "#0A0A0A",
  paper: "#FFF8E7",
  white: "#FFFFFF",
  yellow: "#FFD600",
  pink: "#FF5CA8",
  blue: "#3D5AFE",
  green: "#00C853",
  red: "#FF3B30",
  muted: "#6B6B6B",
} as const;

export const border = { width: 3, thin: 2, radius: 0, color: colors.ink } as const;

// Sombra sólida desfasada, sin blur (se emula con una View detrás: iOS/Android no soportan offset sin blur igual)
export const shadow = { offset: 5, color: colors.ink } as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;

export const touch = { min: 44 } as const;

export const font = {
  family: Platform.select({ ios: "Menlo", android: "monospace", default: "monospace" }),
  size: { sm: 13, md: 16, lg: 22, xl: 32 },
  weight: { regular: "500", bold: "800", black: "900" },
} as const;

export const theme = { colors, border, shadow, space, touch, font };
export type Theme = typeof theme;
