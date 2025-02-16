import { StyleSheet, TextInput, ActivityIndicator, Modal, TouchableOpacity, View, Text } from 'react-native';
import { useState, useCallback, useMemo } from 'react';
import { useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSearchStore } from '@/lib/searchStore';
import { ThumbnailGrid } from '@/components/ThumbnailGrid';
import IngredientsModal from '@/components/IngredientsModal';
import { usePostStore } from '@/lib/postStore';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import CameraModal from '@/components/CameraModal';
import { router } from 'expo-router';
import debounce from 'lodash/debounce';
import { Post } from '@/lib/firebase'

export default function SearchPage() {
  const { isLoading, searchText, matchingIds, matchScores, setSearchText, handleTextSearch, ingredients, setIngredients } = useSearchStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const { posts } = usePostStore();
  const { top } = useSafeAreaInsets();

  const displayedPosts = useMemo(
    () => {
      if (ingredients !== null) return [];

      if (searchText.trim().length > 0 && matchingIds.length === 0) return [];

      if (matchingIds.length === 0) return [];

      return matchingIds.map(id => posts.find(p => p.id === id)).filter(Boolean) as Post[]
    },
    [matchingIds, posts, ingredients, searchText]
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
        <TouchableOpacity style={styles.cameraButton} onPress={() => setIngredients([''])}>
          <Ionicons name="leaf" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraButton} onPress={openCamera}>
          <Ionicons name="camera" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : (
        <ThumbnailGrid
          posts={displayedPosts}
          onPostPress={onPostPress}
          scores={matchScores.length > 0 ? matchScores : undefined}
        />
      )}

      <CameraModal isCameraOpen={isCameraOpen} setIsCameraOpen={setIsCameraOpen} />
      <IngredientsModal />
    </ThemedView>
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
});
