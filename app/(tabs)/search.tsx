import { StyleSheet, TextInput, Keyboard, ActivityIndicator, Modal, TouchableOpacity, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useCallback, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThumbnailGrid } from '@/components/ThumbnailGrid';
import { httpsCallable } from 'firebase/functions';
import * as ImagePicker from 'expo-image-picker';
import { usePostStore } from '@/lib/postStore';
import { ThemedView } from '@/components/ThemedView';
import { functions } from '@/lib/firebase';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { create } from 'zustand';
import debounce from 'lodash/debounce';

type SearchStore = {
  isLoading: boolean;
  searchText: string;
  matchingIds: string[];
  isCameraOpen: boolean;
  setSearchText: (text: string) => void;
  handleTextSearch: () => Promise<void>;
  handlePhotoSearch: (base64Image: string) => Promise<void>;
  setIsCameraOpen: (isOpen: boolean) => void;
}

const useSearchStore = create<SearchStore>((set, get) => ({
  isLoading: false,
  searchText: '',
  matchingIds: [],
  isCameraOpen: false,
  setSearchText: (text: string) => set({ searchText: text }),
  setIsCameraOpen: (isOpen: boolean) => set({ isCameraOpen: isOpen }),
  handleTextSearch: async () => {
    const { searchText } = get();
    if (!searchText.trim()) {
      set({ matchingIds: [] });
      return;
    }

    set({ isLoading: true });
    try {
      const searchPostDescriptions = httpsCallable(functions, 'searchPostDescriptions');
      const result = await searchPostDescriptions({ query: searchText });
      const { postIds } = result.data as { postIds: string[] };
      set({ matchingIds: postIds });
    } catch (error) {
      console.error('Text search failed:', error);
      set({ matchingIds: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  handlePhotoSearch: async (base64Image: string) => {
    set({ searchText: '', isLoading: true });
    
    try {
      const searchPostsByPhoto = httpsCallable(functions, 'searchPostsByPhoto');
      const result = await searchPostsByPhoto({ photo: base64Image });
      const { postIds } = result.data as { postIds: string[] };
      set({ matchingIds: postIds });
    } catch (error) {
      console.error('Photo search failed:', error);
      set({ matchingIds: [] });
    } finally {
      set({ isLoading: false });
    }
  },
}));

export default function SearchPage() {
  const { isLoading, searchText, matchingIds, setSearchText, handleTextSearch, setIsCameraOpen } = useSearchStore();
  const [permission, requestPermission] = useCameraPermissions();
  const { posts } = usePostStore();
  const { top } = useSafeAreaInsets();

  const displayedPosts = useMemo(() => matchingIds.length === 0
      ? posts : posts.filter(post => matchingIds.includes(post.id)),
    [matchingIds, posts]
  );

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setIsCameraOpen(true);
  };

  const onPostPress = (post: any) => {
    const params = { postId: post.id, userId: post.author_id, type: 'all' }
    router.push({ pathname: '/(modals)/post', params });
  };

  const debouncedTextSearch = useCallback(debounce(() => handleTextSearch(), 300), []);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.searchContainer, { marginTop: top }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          placeholderTextColor="#999"
          clearButtonMode="while-editing"
          value={searchText}
          onChangeText={(text) => {
            setSearchText(text);
            debouncedTextSearch();
          }}
        />
        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ThumbnailGrid
          posts={displayedPosts}
          onScroll={() => Keyboard.dismiss()}
          onPostPress={onPostPress}
        />
      )}

      <CameraModal />
    </ThemedView>
  );
}

function CameraModal() {
  const { handlePhotoSearch, isCameraOpen, setIsCameraOpen } = useSearchStore();
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
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
    color: '#000',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },
  cameraButton: {
    padding: 8,
  },
  loader: {
    marginTop: 20,
  },
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
