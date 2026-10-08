import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'pms_auth_token';

/** The JWT lives only in the device keystore (Expo SecureStore) - never in state, logs or UI. */
export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  async set(token: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } catch {
      /* nothing stored / store unavailable - nothing to clear */
    }
  },
};
