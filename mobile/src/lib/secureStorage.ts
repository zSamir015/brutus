import * as SecureStore from "expo-secure-store";

// SecureStore (Keychain/Keystore) limita ~2KB por valor en Android. La sesión de Supabase
// es mayor, así que se parte en trozos: key.0, key.1, ... + key.count
const CHUNK = 1800;
const opts: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY, // sin backup iCloud, requiere desbloqueo
};

export const secureStorage = {
  async getItem(key: string): Promise<string | null> {
    const count = await SecureStore.getItemAsync(`${key}.count`, opts);
    if (!count) return null;
    const parts: string[] = [];
    for (let i = 0; i < Number(count); i++) {
      const p = await SecureStore.getItemAsync(`${key}.${i}`, opts);
      if (p === null) return null; // corrupto → tratar como sin sesión
      parts.push(p);
    }
    return parts.join("");
  },

  async setItem(key: string, value: string): Promise<void> {
    await secureStorage.removeItem(key);
    const n = Math.ceil(value.length / CHUNK);
    for (let i = 0; i < n; i++) {
      await SecureStore.setItemAsync(`${key}.${i}`, value.slice(i * CHUNK, (i + 1) * CHUNK), opts);
    }
    await SecureStore.setItemAsync(`${key}.count`, String(n), opts);
  },

  async removeItem(key: string): Promise<void> {
    const count = await SecureStore.getItemAsync(`${key}.count`, opts);
    for (let i = 0; i < Number(count ?? 0); i++) await SecureStore.deleteItemAsync(`${key}.${i}`, opts);
    await SecureStore.deleteItemAsync(`${key}.count`, opts);
  },
};
