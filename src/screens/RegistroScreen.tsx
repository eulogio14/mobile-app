import React, { useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { getFriendlyErrorMessage } from '../utils/errors';
import type { RootStackParamList } from '../navigation/navigationRef';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEFAULT_PHOTO = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
const DEFAULT_USER_PHOTO = 'https://i.pravatar.cc/150?img=12';

export default function RegistroScreen({ navigation }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [exName, setExName] = useState('');
  const [userPhoto, setUserPhoto] = useState('');
  const [exPhoto, setExPhoto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickPhoto = async (target: 'user' | 'ex', fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permiso requerido',
        fromCamera
          ? 'No se otorgó permiso de cámara. Puedes usar la galería como respaldo.'
          : 'No se otorgó permiso para acceder a tus fotos.',
        fromCamera
          ? [{ text: 'Cancelar' }, { text: 'Abrir galería', onPress: () => pickPhoto(target, false) }]
          : [{ text: 'OK' }]
      );
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const mime = asset.mimeType || 'image/jpeg';
    const dataUri = asset.base64 ? `data:${mime};base64,${asset.base64}` : asset.uri;
    if (target === 'user') setUserPhoto(dataUri);
    else setExPhoto(dataUri);
  };

  const handleRegister = async () => {
    setError(null);
    if (!name.trim() || !email.trim() || !password.trim() || !exName.trim()) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Ingresa un correo con formato válido.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await register({
        nombre: name.trim(),
        email: email.trim(),
        password,
        nombreEx: exName.trim(),
        fotoPerfilEx: exPhoto || DEFAULT_PHOTO,
        fotoPerfil: userPhoto || DEFAULT_USER_PHOTO,
      });
    } catch (e) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Crear cuenta</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Text style={styles.section}>Tus datos</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Tu nombre" placeholderTextColor="#8696a0" editable={!loading} />
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Correo electrónico" placeholderTextColor="#8696a0" autoCapitalize="none" keyboardType="email-address" editable={!loading} />
        <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Contraseña (mín. 6)" placeholderTextColor="#8696a0" secureTextEntry editable={!loading} />
        <View style={styles.photoRow}>
          <Image source={{ uri: userPhoto || DEFAULT_USER_PHOTO }} style={styles.avatar} />
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.smallBtn} onPress={() => pickPhoto('user', true)} disabled={loading}><Text style={styles.smallBtnText}>Cámara</Text></TouchableOpacity>
            <TouchableOpacity style={styles.smallBtn} onPress={() => pickPhoto('user', false)} disabled={loading}><Text style={styles.smallBtnText}>Galería</Text></TouchableOpacity>
          </View>
        </View>
        <Text style={styles.section}>Datos de tu ex</Text>
        <TextInput style={styles.input} value={exName} onChangeText={setExName} placeholder="Nombre de tu ex" placeholderTextColor="#8696a0" editable={!loading} />
        <View style={styles.photoRow}>
          <Image source={{ uri: exPhoto || DEFAULT_PHOTO }} style={styles.avatar} />
          <View style={styles.photoActions}>
            <TouchableOpacity style={styles.smallBtn} onPress={() => pickPhoto('ex', true)} disabled={loading}><Text style={styles.smallBtnText}>Cámara</Text></TouchableOpacity>
            <TouchableOpacity style={styles.smallBtn} onPress={() => pickPhoto('ex', false)} disabled={loading}><Text style={styles.smallBtnText}>Galería</Text></TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleRegister} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creando cuenta...' : 'Registrarme'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
          <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b141a' },
  content: { flexGrow: 1, padding: 24, paddingTop: 48 },
  title: { color: '#e9edef', fontSize: 24, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  section: { color: '#00a884', fontSize: 13, fontWeight: '600', marginTop: 8, marginBottom: 8 },
  error: { color: '#f87171', textAlign: 'center', marginBottom: 12, fontSize: 13 },
  input: { backgroundColor: '#2a3942', borderRadius: 10, padding: 14, color: '#e9edef', marginBottom: 10 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  photoActions: { flexDirection: 'row', gap: 8 },
  smallBtn: { backgroundColor: '#202c33', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallBtnText: { color: '#e9edef', fontSize: 13 },
  button: { backgroundColor: '#00a884', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.6 },
  link: { color: '#00a884', textAlign: 'center', marginTop: 16, marginBottom: 24 },
});
