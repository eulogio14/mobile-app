import React, { useEffect, useRef } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Message } from '../../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

type Props = {
  messages: Message[];
  showTyping: boolean;
  emptyContent?: React.ReactNode;
};

export default function MessageList({ messages, showTyping, emptyContent }: Props) {
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages, showTyping]);

  if (messages.length === 0) {
    return (
      <View style={styles.empty}>
        {emptyContent ?? (
          <>
            <Text style={styles.emptyTitle}>Simulador listo</Text>
            <Text style={styles.emptyText}>Escríbele lo que quieras decirle a tu ex. Aquí es seguro.</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <FlatList
      ref={listRef}
      data={messages}
      keyExtractor={(item) => String(item.id)}
      renderItem={({ item }) => <MessageBubble message={item} />}
      contentContainerStyle={styles.list}
      ListFooterComponent={showTyping ? <TypingIndicator /> : undefined}
      onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
    />
  );
}

const styles = StyleSheet.create({
  list: { paddingVertical: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyTitle: { color: '#e9edef', fontSize: 16, fontWeight: '600', marginBottom: 6 },
  emptyText: { color: '#8696a0', textAlign: 'center', fontSize: 13 },
});
