import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = { message: string; onRetry?: () => void };

export default function ErrorMessage({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#0b141a' },
  text: { color: '#f87171', textAlign: 'center', marginBottom: 12 },
  button: { backgroundColor: '#00a884', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
  buttonText: { color: '#000', fontWeight: '600' },
});
