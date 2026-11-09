import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';
import type { AuthResponse, RegisterPayload, User } from '../types';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

type BackendUser = {
  id?: number;
  nombre?: string;
  email?: string;
  nombreEx?: string;
  fotoPerfilEx?: string | null;
  fotoPerfil?: string | null;
  personalidadEx?: string;
  estadoWhatsAppEx?: string;
  [key: string]: unknown;
};

const mapUser = (u: BackendUser): User => ({
  id: u.id,
  name: u.nombre,
  email: u.email,
  exName: u.nombreEx,
  exPhotoUrl: u.fotoPerfilEx ?? null,
  photoUrl: u.fotoPerfil ?? null,
  exPersonality: u.personalidadEx,
  exWhatsAppStatus: u.estadoWhatsAppEx,
  ...u,
});

const persistSession = async (accessToken: string, refreshToken: string, user: User) => {
  await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await api.post('/auth/login', { email, password });
  const { accessToken, refreshToken, usuario } = res.data;
  const user = mapUser(usuario);
  await persistSession(accessToken, refreshToken, user);
  return { accessToken, refreshToken, user };
};

export const register = async (payload: RegisterPayload): Promise<AuthResponse> => {
  const res = await api.post('/auth/registro', payload);
  const { accessToken, refreshToken, usuario } = res.data;
  const user = mapUser(usuario);
  await persistSession(accessToken, refreshToken, user);
  return { accessToken, refreshToken, user };
};

export const logout = async (): Promise<void> => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
};

export const loadStoredSession = async (): Promise<{ token: string; user: User } | null> => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) as User };
  } catch {
    return null;
  }
};

export const updateStoredUser = async (user: User): Promise<void> => {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
};

export { mapUser };
