import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function TypingIndicator() {
  return (
    <View style={styles.row}>
      <View style={styles.bubble}>
        <Text style={styles.dots}>•••</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 12, paddingVertical: 4, alignItems: 'flex-start' },
  bubble: { backgroundColor: '#202c33', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8 },
  dots: { color: '#8696a0', fontSize: 18, letterSpacing: 2 },
});
