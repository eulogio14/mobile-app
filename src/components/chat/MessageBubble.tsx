import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { Message } from '../../types';

const formatTime = (value: string) => {
  if (!value) return '';
  const d = new Date(value);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function MessageBubble({ message }: { message: Message }) {
  const isMine = message.sender === 'USUARIO';
  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowOther]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={styles.content}>{message.content}</Text>
        <Text style={styles.time}>{formatTime(message.timestamp)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 2 },
  rowMine: { alignItems: 'flex-end' },
  rowOther: { alignItems: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  bubbleMine: { backgroundColor: '#005c4b' },
  bubbleOther: { backgroundColor: '#202c33' },
  content: { color: '#e9edef', fontSize: 15 },
  time: { color: '#8696a0', fontSize: 10, textAlign: 'right', marginTop: 2 },
});
