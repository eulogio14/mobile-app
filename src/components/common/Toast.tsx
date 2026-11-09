import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = { message: string; type: 'success' | 'error' };

export default function Toast({ message, type }: Props) {
  return (
    <View style={[styles.container, type === 'error' ? styles.error : styles.success]}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute', left: 16, right: 16, bottom: 32,
    padding: 12, borderRadius: 10, zIndex: 100,
  },
  success: { backgroundColor: '#065f46' },
  error: { backgroundColor: '#7f1d1d' },
  text: { color: '#fff', textAlign: 'center', fontSize: 13 },
});
