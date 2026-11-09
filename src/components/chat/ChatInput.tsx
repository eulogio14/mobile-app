import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = { disabled: boolean; onSend: (text: string) => void };

export default function ChatInput({ disabled, onSend }: Props) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const clean = text.trim();
    if (!clean || disabled) return;
    setText('');
    onSend(clean);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder="Escribe un mensaje"
        placeholderTextColor="#8696a0"
        editable={!disabled}
        multiline
      />
      <TouchableOpacity
        style={[styles.button, (!text.trim() || disabled) && styles.buttonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || disabled}
      >
        <Text style={styles.buttonText}>➤</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'flex-end', padding: 8, backgroundColor: '#1f2c33', gap: 8 },
  input: {
    flex: 1, minHeight: 42, maxHeight: 120, backgroundColor: '#2a3942', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10, color: '#e9edef', fontSize: 15,
  },
  button: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#00a884', alignItems: 'center', justifyContent: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#000', fontSize: 18, fontWeight: '700' },
});
