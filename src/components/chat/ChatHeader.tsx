import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';

type Props = {
  statusText: string;
  onTrain: () => void;
  onSettings: () => void;
  onPurge: () => void;
};

const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

export default function ChatHeader({ statusText, onTrain, onSettings, onPurge }: Props) {
  const { user } = useAuth();
  const underConstruction = () => Alert.alert('En construcción', 'Esta función estará disponible pronto.');

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image source={{ uri: user?.exPhotoUrl || DEFAULT_PHOTO }} style={styles.avatar} />
        <View>
          <Text style={styles.name}>{user?.exName ?? 'Mi ex'}</Text>
          <Text style={styles.status}>{statusText}</Text>
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={underConstruction} style={styles.actionBtn}><Text style={styles.action}>📞</Text></TouchableOpacity>
        <TouchableOpacity onPress={underConstruction} style={styles.actionBtn}><Text style={styles.action}>🔍</Text></TouchableOpacity>
        <TouchableOpacity onPress={onTrain} style={styles.actionBtn}><Text style={styles.action}>🧠</Text></TouchableOpacity>
        <TouchableOpacity onPress={onSettings} style={styles.actionBtn}><Text style={styles.action}>⚙️</Text></TouchableOpacity>
        <TouchableOpacity onPress={onPurge} style={styles.actionBtn}><Text style={styles.action}>🗑️</Text></TouchableOpacity>
        <TouchableOpacity onPress={underConstruction} style={styles.actionBtn}><Text style={styles.action}>⋮</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 60, backgroundColor: '#1f2c33', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#2a3942',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  name: { color: '#e9edef', fontWeight: '600', fontSize: 15 },
  status: { color: '#8696a0', fontSize: 12 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { padding: 6 },
  action: { fontSize: 16 },
});
