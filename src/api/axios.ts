import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { navigateToLogin } from '../navigation/navigationRef';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

let onAuthFailure: (() => void) | null = null;

export const setAuthFailureHandler = (handler: () => void) => {
  onAuthFailure = handler;
};

export const clearSessionStorage = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    const isAuthRoute = url.includes('/auth/');
    if (status === 401 && !isAuthRoute) {
      await clearSessionStorage();
      if (onAuthFailure) onAuthFailure();
      navigateToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
