import { StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/ThemedView';
import { useState } from 'react';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const { top } = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: top }]}>
      <ThemedView style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#666"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchInput: {
    height: 40,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
});
