import { supabase } from "./supabase";
import { createLimiter } from "./rateLimit";
import { taskSchema } from "./validation";

export type Task = { id: string; title: string; done: boolean; created_at: string };

const createLimit = createLimiter(5, 10_000);

// Lectura: RLS filtra por auth.uid() — el cliente solo recibe sus filas.
export async function listTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("id,title,done,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error("No se pudo cargar");
  return data;
}

// Escritura crítica: pasa por Edge Function (validación + rate limit + IP limit en servidor).
export async function createTask(raw: unknown): Promise<Task> {
  if (!createLimit()) throw new Error("Demasiado rápido. Espera unos segundos.");
  const input = taskSchema.parse(raw);
  const { data, error } = await supabase.functions.invoke("create-task", { body: input });
  if (error) {
    const status = (error as { context?: Response }).context?.status;
    throw new Error(status === 429 ? "Límite alcanzado. Intenta luego." : "No se pudo crear");
  }
  return data as Task;
}

export async function toggleTask(id: string, done: boolean): Promise<void> {
  const { error } = await supabase.from("tasks").update({ done }).eq("id", id); // RLS: solo dueño
  if (error) throw new Error("No se pudo actualizar");
}
