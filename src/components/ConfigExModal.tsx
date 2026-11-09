import React, { useEffect, useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/AuthContext';
import { updateExConfig } from '../services/usuarioService';
import { getFriendlyErrorMessage } from '../utils/errors';
import { useToast } from '../contexts/ToastContext';

type Props = { visible: boolean; onClose: () => void };

export default function ConfigExModal({ visible, onClose }: Props) {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState(user?.exName ?? '');
  const [photo, setPhoto] = useState(user?.exPhotoUrl ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setName(user?.exName ?? '');
      setPhoto(user?.exPhotoUrl ?? '');
    }
  }, [visible, user?.exName, user?.exPhotoUrl]);

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permiso requerido', 'No se otorgó permiso. Puedes usar la galería o pegar una URL.', [
        { text: 'OK' },
        { text: 'Abrir galería', onPress: () => !fromCamera || pickImage(false) },
      ]);
      if (fromCamera) return;
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const mime = asset.mimeType || 'image/jpeg';
      const dataUri = asset.base64 ? `data:${mime};base64,${asset.base64}` : asset.uri;
      setPhoto(dataUri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Falta información', 'El nombre es obligatorio.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        nombreEx: name.trim(),
        apodoEx: (user?.exNickname as string) || '',
        fotoPerfilEx: photo,
        estadoWhatsAppEx: (user?.exWhatsAppStatus as string) || '',
        personalidadEx: (user?.exPersonality as string) || '',
        fechaRuptura: (user?.breakupDate as string) || '',
      };
      const updated = await updateExConfig(payload);
      updateUser({ ...updated, exName: name.trim(), exPhotoUrl: photo });
      showToast('Configuración guardada', 'success');
      onClose();
    } catch (e) {
      Alert.alert('Error', getFriendlyErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Configurar ex</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.body}>
            <Text style={styles.label}>Nombre mostrado</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Nombre" placeholderTextColor="#8696a0" />
            <Text style={styles.label}>Foto</Text>
            {photo ? <Image source={{ uri: photo }} style={styles.preview} /> : null}
            <View style={styles.row}>
              <TouchableOpacity style={styles.smallBtn} onPress={() => pickImage(true)}><Text style={styles.smallBtnText}>Cámara</Text></TouchableOpacity>
              <TouchableOpacity style={styles.smallBtn} onPress={() => pickImage(false)}><Text style={styles.smallBtnText}>Galería</Text></TouchableOpacity>
            </View>
            <TextInput style={styles.input} value={photo.startsWith('data:') ? '' : photo} onChangeText={setPhoto} placeholder="O pega una URL" placeholderTextColor="#8696a0" />
            <TouchableOpacity style={[styles.saveBtn, saving && styles.disabled]} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Guardando...' : 'Guardar'}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#111b21', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '90%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#2a3942' },
  title: { color: '#e9edef', fontSize: 16, fontWeight: '600' },
  close: { color: '#8696a0', fontSize: 18 },
  body: { padding: 14 },
  label: { color: '#8696a0', fontSize: 12, marginTop: 10, marginBottom: 4 },
  input: { backgroundColor: '#2a3942', borderRadius: 10, padding: 12, color: '#e9edef' },
  preview: { width: 72, height: 72, borderRadius: 36, marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  smallBtn: { backgroundColor: '#202c33', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallBtnText: { color: '#e9edef', fontSize: 13 },
  saveBtn: { backgroundColor: '#00a884', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  saveText: { color: '#000', fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
