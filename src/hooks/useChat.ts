import { useCallback, useEffect, useRef, useState } from 'react';
import { clearMessages, getExChat, sendMessage } from '../services/chatService';
import type { Chat, Message } from '../types';
import { getFriendlyErrorMessage } from '../utils/errors';

const POLL_INTERVAL_MS = 30_000;

export function useChat() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await getExChat();
      if (!mountedRef.current) return;
      setChat(data);
      setMessages(data.messages ?? []);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(getFriendlyErrorMessage(e));
    } finally {
      if (mountedRef.current && !silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  const last = messages[messages.length - 1];
  const waitingForReply = last?.sender === 'USUARIO';

  useEffect(() => {
    if (!waitingForReply) return;
    const id = setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [waitingForReply, load]);

  const send = async (content: string) => {
    if (!chat || sending) return;
    setSending(true);
    setError(null);
    const temp: Message = {
      id: -Date.now(),
      content,
      sender: 'USUARIO',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, temp]);
    try {
      await sendMessage(chat.id, content);
      await load(true);
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== temp.id));
      setError(getFriendlyErrorMessage(e));
      throw e;
    } finally {
      if (mountedRef.current) setSending(false);
    }
  };

  const clear = async () => {
    if (!chat) return;
    try {
      await clearMessages(chat.id);
      setMessages([]);
    } catch (e) {
      setError(getFriendlyErrorMessage(e));
      throw e;
    }
  };

  return { chat, messages, loading, sending, error, waitingForReply, send, clear, reload: () => load(true) };
}
