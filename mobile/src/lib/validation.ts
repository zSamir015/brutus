import { z } from "zod";

// Quita caracteres de control y colapsa espacios. Zod valida forma; el servidor revalida todo.
const clean = (s: string) => s.replace(/[\u0000-\u001F\u007F]/g, "").replace(/\s+/g, " ").trim();

export const loginSchema = z.object({
  email: z.string().transform(clean).pipe(z.string().email("Email inválido").max(254)),
  password: z.string().min(8, "Mínimo 8 caracteres").max(72, "Máximo 72"),
});

export const taskSchema = z.object({
  title: z
    .string()
    .transform(clean)
    .pipe(
      z
        .string()
        .min(1, "Requerido")
        .max(80, "Máximo 80")
        .regex(/^[^<>{}$`\\]*$/, "Caracteres no permitidos"),
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
