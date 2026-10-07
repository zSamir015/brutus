import { create } from "zustand";
import { createTask, listTasks, toggleTask, type Task } from "@/lib/api";

type Status = "idle" | "loading" | "error";

type TasksState = {
  items: Task[];
  status: Status;
  error: string | null;
  load: () => Promise<void>;
  add: (title: string) => Promise<void>;
  toggle: (id: string) => Promise<void>;
};

export const useTasks = create<TasksState>((set, getState) => ({
  items: [],
  status: "idle",
  error: null,

  async load() {
    set({ status: "loading", error: null });
    try {
      set({ items: await listTasks(), status: "idle" });
    } catch (e) {
      set({ status: "error", error: (e as Error).message });
    }
  },

  async add(title) {
    const task = await createTask({ title }); // lanza si falla; la UI muestra el error
    set((s) => ({ items: [task, ...s.items] }));
  },

  async toggle(id) {
    const prev = getState().items;
    const target = prev.find((t) => t.id === id);
    if (!target) return;
    set({ items: prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) }); // optimista
    try {
      await toggleTask(id, !target.done);
    } catch {
      set({ items: prev }); // rollback
    }
  },
}));
