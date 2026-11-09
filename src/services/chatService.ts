import api from '../api/axios';
import type { Chat, Message, Sender } from '../types';

type MessageApi = {
  id: number;
  contenido: string;
  remitente: Sender;
  timestamp?: string;
  fechaEnvio?: string;
  estado?: string;
};

type ChatApi = {
  id: number;
  tipo?: string;
  fechaCreacion?: string;
  mensajes?: MessageApi[];
};

const mapMessage = (m: MessageApi): Message => ({
  id: m.id,
  content: m.contenido,
  sender: m.remitente,
  timestamp: m.timestamp ?? m.fechaEnvio ?? '',
  status: m.estado,
});

export const getExChat = async (): Promise<Chat> => {
  const res = await api.get<ChatApi>('/chats/CHAT_EX');
  return {
    id: res.data.id,
    type: res.data.tipo,
    createdAt: res.data.fechaCreacion,
    messages: (res.data.mensajes ?? []).map(mapMessage),
  };
};

export const sendMessage = async (chatId: number, content: string): Promise<void> => {
  await api.post(`/chats/${chatId}/mensajes`, { contenido: content });
};

export const clearMessages = async (chatId: number): Promise<void> => {
  await api.delete(`/chats/${chatId}/mensajes`);
};
