import * as SecureStore from 'expo-secure-store';

export const TokenService = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('accessToken');
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync('refreshToken');
  },

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
};