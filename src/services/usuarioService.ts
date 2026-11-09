import api from '../api/axios';
import type { TrainingTask, TrainingTextResult, User } from '../types';
import { mapUser } from './authService';

export const updateExConfig = async (payload: { nombreEx: string; fotoPerfilEx?: string; [k: string]: unknown }): Promise<User> => {
  const res = await api.put('/usuarios/config-ex', payload);
  return mapUser(res.data);
};

export const updateProfilePhoto = async (photoBase64: string): Promise<string> => {
  const res = await api.put('/usuarios/perfil/foto', { fotoPerfil: photoBase64 });
  return res.data?.fotoPerfil ?? photoBase64;
};

export const uploadTrainingImages = async (images: Array<{ uri: string; name: string; type: string }>, exName?: string): Promise<TrainingTask> => {
  const formData = new FormData();
  images.forEach((img) => {
    formData.append('imagenes', { uri: img.uri, name: img.name, type: img.type } as unknown as Blob);
  });
  if (exName) formData.append('nombreRemitenteEx', exName);
  const res = await api.post('/usuarios/ex-dataset/imagenes', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const getTrainingTask = async (taskId: number): Promise<TrainingTask> => {
  const res = await api.get(`/usuarios/ex-dataset/imagenes/tareas/${taskId}`);
  return res.data;
};

export const uploadTrainingText = async (chatContent: string, exSenderName?: string): Promise<TrainingTextResult> => {
  const res = await api.post('/usuarios/ex-dataset', {
    contenidoChat: chatContent,
    nombreRemitenteEx: exSenderName || 'Ex',
  });
  return res.data;
};

export const getProfile = async (): Promise<User> => {
  const res = await api.get('/usuarios/perfil');
  return mapUser(res.data);
};
