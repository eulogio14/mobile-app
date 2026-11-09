import React, { useState } from 'react';
import {
  KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { getFriendlyErrorMessage } from '../utils/errors';
import type { RootStackParamList } from '../navigation/navigationRef';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Completa tu correo y contraseña.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError('Ingresa un correo con formato válido.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(getFriendlyErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Contacto Cero</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Correo electrónico"
          placeholderTextColor="#8696a0"
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Contraseña"
          placeholderTextColor="#8696a0"
          secureTextEntry
          editable={!loading}
        />
        <TouchableOpacity style={[styles.button, loading && styles.disabled]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Iniciar sesión'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b141a' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  title: { color: '#e9edef', fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 6 },
  subtitle: { color: '#8696a0', textAlign: 'center', marginBottom: 24 },
  error: { color: '#f87171', textAlign: 'center', marginBottom: 12, fontSize: 13 },
  input: { backgroundColor: '#2a3942', borderRadius: 10, padding: 14, color: '#e9edef', marginBottom: 12 },
  button: { backgroundColor: '#00a884', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 4 },
  buttonText: { color: '#000', fontWeight: '700', fontSize: 15 },
  disabled: { opacity: 0.6 },
  link: { color: '#00a884', textAlign: 'center', marginTop: 16 },
});
