import React, { useCallback, useEffect, useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import ConfigExModal from '../components/ConfigExModal';
import EntrenarModal from '../components/EntrenarModal';
import Loader from '../components/common/Loader';
import ErrorMessage from '../components/common/ErrorMessage';
import { useChat } from '../hooks/useChat';
import { useAccelerometer } from '../hooks/useAccelerometer';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { getRandomMotivation, type MotivationQuote } from '../services/motivationService';

export default function ChatScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { messages, loading, sending, error, waitingForReply, send, clear, reload } = useChat();
  const [configOpen, setConfigOpen] = useState(false);
  const [trainOpen, setTrainOpen] = useState(false);
  const [quote, setQuote] = useState<MotivationQuote | null>(null);

  const onShake = useCallback(() => {
    reload();
    showToast('Chat actualizado', 'success');
  }, [reload, showToast]);

  useAccelerometer(onShake);

  useEffect(() => {
    if (!loading && messages.length === 0 && !quote) {
      getRandomMotivation().then(setQuote);
    }
  }, [loading, messages.length, quote]);

  const statusText = sending
    ? 'escribiendo...'
    : waitingForReply
      ? 'esperando respuesta...'
      : 'en línea';

  const handleSend = async (text: string) => {
    try {
      await send(text);
    } catch {
      showToast('No se pudo enviar el mensaje', 'error');
    }
  };

  const handlePurge = () => {
    Alert.alert('Purgar historial', '¿Seguro que quieres eliminar todos los mensajes?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await clear();
            setQuote(null);
            showToast('Historial eliminado', 'success');
          } catch {
            showToast('No se pudo eliminar el historial', 'error');
          }
        },
      },
    ]);
  };

  if (loading) return <Loader />;

  if (error && messages.length === 0) {
    return <ErrorMessage message={error} onRetry={reload} />;
  }

  const emptyContent = (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyTitle}>Simulador listo</Text>
      <Text style={styles.emptyText}>Escríbele lo que quieras decirle a tu ex. Aquí es seguro.</Text>
      {quote && (
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>“{quote.content}”</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
          <TouchableOpacity onPress={() => getRandomMotivation().then(setQuote)}>
            <Text style={styles.quoteRefresh}>Otra frase</Text>
          </TouchableOpacity>
        </View>
      )}
      <Text style={styles.hint}>Tip: sacude el teléfono para recargar el chat.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ChatHeader
        statusText={statusText}
        onTrain={() => setTrainOpen(true)}
        onSettings={() => setConfigOpen(true)}
        onPurge={handlePurge}
      />
      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      <View style={styles.listWrap}>
        <MessageList messages={messages} showTyping={sending || waitingForReply} emptyContent={emptyContent} />
      </View>
      <ChatInput disabled={sending} onSend={handleSend} />
      <ConfigExModal visible={configOpen} onClose={() => setConfigOpen(false)} />
      <EntrenarModal visible={trainOpen} onClose={() => setTrainOpen(false)} exName={user?.exName} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b141a' },
  listWrap: { flex: 1 },
  inlineError: { color: '#f87171', textAlign: 'center', fontSize: 12, paddingVertical: 4, backgroundColor: '#1f2c33' },
  emptyWrap: { alignItems: 'center', padding: 24 },
  emptyTitle: { color: '#e9edef', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyText: { color: '#8696a0', textAlign: 'center', fontSize: 13, marginBottom: 16 },
  quoteBox: { backgroundColor: '#1f2c33', borderRadius: 12, padding: 14, width: '100%', marginBottom: 12 },
  quoteText: { color: '#e9edef', fontSize: 13, fontStyle: 'italic', textAlign: 'center' },
  quoteAuthor: { color: '#8696a0', fontSize: 12, textAlign: 'center', marginTop: 6 },
  quoteRefresh: { color: '#00a884', fontSize: 12, textAlign: 'center', marginTop: 8 },
  hint: { color: '#8696a0', fontSize: 11, marginTop: 4 },
});
