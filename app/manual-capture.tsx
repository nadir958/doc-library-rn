import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../src/theme/colors';
import { useAppTheme } from '../src/theme/theme';

export default function ManualCaptureScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();
  const theme = useAppTheme();
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const takePicture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        setCapturedImages(prev => [...prev, photo.uri]);
      }
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de prendre la photo.');
    }
  };

  const handleDone = () => {
    if (capturedImages.length === 0) {
      router.back();
      return;
    }
    router.replace({
      pathname: '/capture-preview',
      params: { imagePaths: JSON.stringify(capturedImages) },
    });
  };

  if (!permission?.granted) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <Ionicons name="camera-outline" size={64} color={theme.colors.primary} />
        <Text style={{ color: theme.colors.onSurface, marginTop: 16, textAlign: 'center', paddingHorizontal: 32 }}>
          L'accès à la caméra est nécessaire pour scanner des documents.
        </Text>
        <TouchableOpacity onPress={requestPermission} style={[styles.permissionBtn, { backgroundColor: theme.colors.primary }]}>
          <Text style={{ color: theme.isDark ? Colors.background : '#fff', fontWeight: '700' }}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Header overlay */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.topBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          {capturedImages.length > 0 && (
            <TouchableOpacity onPress={handleDone} style={styles.doneBtn}>
              <Text style={styles.doneText}>Terminé ({capturedImages.length})</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{capturedImages.length} photo(s)</Text>
          </View>

          <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
            <View style={styles.captureInner} />
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDone} disabled={capturedImages.length === 0}>
            <Ionicons name="checkmark-circle" size={40} color={capturedImages.length > 0 ? Colors.primary : 'rgba(255,255,255,0.3)'} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  permissionBtn: { marginTop: 24, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  topBtn: { padding: 8 },
  doneBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  doneText: { color: Colors.background, fontWeight: '700', fontSize: 14 },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    padding: Spacing.xl,
    paddingBottom: 50,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  countBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  countText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  captureBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});
