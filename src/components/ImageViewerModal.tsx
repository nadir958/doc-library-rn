import React from 'react';
import {
  Image,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

interface ImageViewerModalProps {
  images: { uri: string }[];
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
}

export function ImageViewerModal({
  images,
  imageIndex,
  visible,
  onRequestClose,
}: ImageViewerModalProps) {
  const activeImage = images[imageIndex];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <Pressable style={styles.overlay} onPress={onRequestClose}>
        <View style={styles.content}>
          {activeImage ? (
            <Image
              source={{ uri: activeImage.uri }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
