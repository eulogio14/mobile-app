import React, { useEffect, useRef, useState } from 'react';
import {
  Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getTrainingTask, uploadTrainingImages, uploadTrainingText } from '../services/usuarioService';
import { getFriendlyErrorMessage } from '../utils/errors';
import { useToast } from '../contexts/ToastContext';
import type { TrainingTask } from '../types';

type Props = { visible: boolean; onClose: () => void; exName?: string };

type Tab = 'capturas' | 'texto';

export default function EntrenarModal({ visible, onClose, exName }: Props) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('capturas');
  const [images, setImages] = useState<Array<{ uri: string; name: string; type: string }>>([]);
  const [task, setTask] = useState<TrainingTask | null>(null);
  const [uploading, setUploading] = useState(false);
  const [chatText, setChatText] = useState('');
  const [textSending, setTextSending] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [visible]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  const pickCaptures = async (fromCamera: boolean) => {
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
          ? [{ text: 'Cancelar' }, { text: 'Abrir galería', onPress: () => pickCaptures(false) }]
          : [{ text: 'OK' }]
      );
      return;
    }
    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, mediaTypes: ImagePicker.MediaTypeOptions.Images })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsMultipleSelection: true, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (result.canceled) return;
    const picked = result.assets.map((a, i) => ({
      uri: a.uri,
      name: a.fileName || `captura_${Date.now()}_${i}.jpg`,
      type: a.mimeType || 'image/jpeg',
    }));
    setImages((prev) => [...prev, ...picked]);
  };

  const startPolling = (taskId: number) => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const t = await getTrainingTask(taskId);
        setTask(t);
        if (t.estado === 'COMPLETED' || t.estado === 'FAILED') {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;
          setUploading(false);
          if (t.estado === 'COMPLETED') {
            showToast('Capturas procesadas correctamente', 'success');
          } else {
            Alert.alert('Error al procesar', t.errorMensaje || t.mensaje || 'No se pudieron procesar las capturas.');
          }
        }
      } catch (e) {
        if (pollRef.current) clearInterval(pollRef.current);
        pollRef.current = null;
        setUploading(false);
        Alert.alert('Error', getFriendlyErrorMessage(e));
      }
    }, 2000);
  };

  const handleUploadImages = async () => {
    if (images.length === 0) {
      Alert.alert('Sin imágenes', 'Selecciona al menos una captura.');
      return;
    }
    setUploading(true);
    setTask(null);
    try {
      const t = await uploadTrainingImages(images, exName);
      setTask(t);
      setImages([]);
      if (t.estado === 'COMPLETED') {
        setUploading(false);
        showToast('Capturas procesadas correctamente', 'success');
      } else if (t.estado === 'FAILED') {
        setUploading(false);
        Alert.alert('Error al procesar', t.errorMensaje || t.mensaje || 'No se pudieron procesar las capturas.');
      } else {
        startPolling(t.taskId);
      }
    } catch (e) {
      setUploading(false);
      Alert.alert('Error', getFriendlyErrorMessage(e));
    }
  };

  const handleUploadText = async () => {
    if (!chatText.trim()) {
      Alert.alert('Texto vacío', 'Pega el contenido del chat exportado.');
      return;
    }
    setTextSending(true);
    try {
      const res = await uploadTrainingText(chatText.trim(), exName);
      showToast(`Entrenamiento enviado${res.tonoDetectado ? ` (tono: ${res.tonoDetectado})` : ''}`, 'success');
      setChatText('');
    } catch (e) {
      Alert.alert('Error', getFriendlyErrorMessage(e));
    } finally {
      setTextSending(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Entrenar IA</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.tabs}>
            <TouchableOpacity style={[styles.tab, tab === 'capturas' && styles.tabActive]} onPress={() => setTab('capturas')}>
              <Text style={[styles.tabText, tab === 'capturas' && styles.tabTextActive]}>Capturas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, tab === 'texto' && styles.tabActive]} onPress={() => setTab('texto')}>
              <Text style={[styles.tabText, tab === 'texto' && styles.tabTextActive]}>Texto exportado</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.body}>
            {tab === 'capturas' ? (
              <>
                <Text style={styles.hint}>Selecciona capturas de WhatsApp para extraer mensajes y entrenar al bot.</Text>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => pickCaptures(true)} disabled={uploading}>
                    <Text style={styles.smallBtnText}>Cámara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => pickCaptures(false)} disabled={uploading}>
                    <Text style={styles.smallBtnText}>Galería</Text>
                  </TouchableOpacity>
                </View>
                {images.length > 0 && <Text style={styles.info}>{images.length} imagen(es) seleccionada(s)</Text>}
                {task && (
                  <View style={styles.statusBox}>
                    <Text style={styles.statusTitle}>Estado: {task.estado}</Text>
                    {task.mensaje ? <Text style={styles.statusText}>{task.mensaje}</Text> : null}
                    <Text style={styles.statusText}>Imágenes procesadas: {task.imagenesProcesadas ?? 0}</Text>
                    <Text style={styles.statusText}>Mensajes nuevos: {task.mensajesNuevos ?? 0}</Text>
                    <Text style={styles.statusText}>Duplicados: {task.mensajesDuplicados ?? 0}</Text>
                    {task.tonoDetectado ? <Text style={styles.statusText}>Tono: {task.tonoDetectado}</Text> : null}
                    {task.errorMensaje ? <Text style={styles.errorText}>{task.errorMensaje}</Text> : null}
                  </View>
                )}
                <TouchableOpacity style={[styles.saveBtn, (uploading || images.length === 0) && styles.disabled]} onPress={handleUploadImages} disabled={uploading || images.length === 0}>
                  <Text style={styles.saveText}>{uploading ? 'Procesando...' : 'Enviar capturas'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.hint}>Pega el chat exportado de WhatsApp para entrenar el estilo de respuesta.</Text>
                <TextInput
                  style={styles.textArea}
                  value={chatText}
                  onChangeText={setChatText}
                  placeholder="Pega aquí el contenido del chat..."
                  placeholderTextColor="#8696a0"
                  multiline
                  editable={!textSending}
                />
                <TouchableOpacity style={[styles.saveBtn, (textSending || !chatText.trim()) && styles.disabled]} onPress={handleUploadText} disabled={textSending || !chatText.trim()}>
                  <Text style={styles.saveText}>{textSending ? 'Enviando...' : 'Entrenar con texto'}</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#111b21', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '92%' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#2a3942' },
  title: { color: '#e9edef', fontSize: 16, fontWeight: '600' },
  close: { color: '#8696a0', fontSize: 18 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#2a3942' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#00a884' },
  tabText: { color: '#8696a0', fontSize: 13 },
  tabTextActive: { color: '#00a884', fontWeight: '600' },
  body: { padding: 14 },
  hint: { color: '#8696a0', fontSize: 13, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  smallBtn: { backgroundColor: '#202c33', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  smallBtnText: { color: '#e9edef', fontSize: 13 },
  info: { color: '#e9edef', fontSize: 13, marginBottom: 8 },
  statusBox: { backgroundColor: '#202c33', borderRadius: 10, padding: 10, marginBottom: 10 },
  statusTitle: { color: '#00a884', fontWeight: '600', marginBottom: 4 },
  statusText: { color: '#e9edef', fontSize: 12, marginTop: 2 },
  errorText: { color: '#f87171', fontSize: 12, marginTop: 4 },
  textArea: { backgroundColor: '#2a3942', borderRadius: 10, padding: 12, color: '#e9edef', minHeight: 160, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: '#00a884', padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  saveText: { color: '#000', fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
