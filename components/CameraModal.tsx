import { StyleSheet, Modal, TouchableOpacity, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearchStore } from '@/lib/searchStore';
import * as ImagePicker from 'expo-image-picker';
import { CameraView } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';

export default function CameraModal({ isCameraOpen, setIsCameraOpen }: { isCameraOpen: boolean, setIsCameraOpen: (isOpen: boolean) => void }) {
  const { handlePhotoSearch } = useSearchStore();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const { top } = useSafeAreaInsets();

  const takePhoto = async () => {
    if (!cameraRef) return;

    try {
      const photo = await cameraRef?.takePictureAsync({
        base64: true,
        quality: 0.7,
      });

      if (photo?.base64) {
        handlePhotoSearch(photo.base64);
        setIsCameraOpen(false);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
    }
  };

  const uploadPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]?.base64) {
        handlePhotoSearch(result.assets[0].base64);
        setIsCameraOpen(false);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
    }
  };

  return (
    <Modal visible={isCameraOpen} animationType="slide">
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          ref={(ref) => setCameraRef(ref)}
          mode={'picture'}
          facing={'back'}
        >
          <View style={[styles.cameraControls, { top }]}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setIsCameraOpen(false)}>
              <Ionicons name="close" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.galleryButton} onPress={uploadPhoto}>
              <Ionicons name="images" size={30} color="white" />
            </TouchableOpacity>
            <View style={styles.captureButtonContainer}>
              <TouchableOpacity style={styles.captureButton} onPress={takePhoto}>
                <View style={styles.captureButtonInner} />
              </TouchableOpacity>
            </View>
          </View>
        </CameraView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    bottom: 50,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  galleryButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
  },
});