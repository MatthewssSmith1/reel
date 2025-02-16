import { StyleSheet, TextInput, Modal, TouchableOpacity, View, Text, ScrollView } from 'react-native';
import { useSearchStore } from '@/lib/searchStore';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/lib/colors';

export default function IngredientsModal() {
  const { ingredients, handleIngredientsSearch, setIngredients } = useSearchStore();

  const handleAddIngredient = () => {
    setIngredients([...(ingredients || []), '']);
  };

  const handleRemoveIngredient = (index: number) => {
    if (!ingredients) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleUpdateIngredient = (index: number, value: string) => {
    if (!ingredients) return;
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  // const handleSubmit = () => {
  //   if (!ingredients) return;
  //   const filteredIngredients = ingredients.filter(i => i.trim() !== '');
  //   if (filteredIngredients.length === 0) {
  //     setIngredients(null);
  //     return;
  //   }
  //   setIngredients(filteredIngredients);
  //   handleIngredientsSearch();
  // };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={ingredients !== null}
      onRequestClose={() => setIngredients(null)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity 
            onPress={() => setIngredients(null)}
            style={styles.closeButton}
          >
            <Ionicons name="close" size={24} color={Colors.dark.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={handleAddIngredient}
            style={styles.addButton}
          >
            <Ionicons name="add" size={24} color={Colors.dark.text} />
          </TouchableOpacity>

          <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            {ingredients?.map((ingredient, index) => (
              <View key={index} style={styles.ingredientRow}>
                <TextInput
                  style={styles.input}
                  value={ingredient}
                  onChangeText={(value) => handleUpdateIngredient(index, value)}
                  placeholder="Enter ingredient"
                  placeholderTextColor={Colors.dark.icon}
                />
                <TouchableOpacity
                  onPress={() => handleRemoveIngredient(index)}
                  style={styles.removeButton}
                >
                  <Ionicons name="remove-circle-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <TouchableOpacity
            onPress={handleIngredientsSearch}
            style={styles.searchButton}
            disabled={!ingredients || ingredients.length === 0}
          >
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.dark.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 25,
    paddingBottom: 60,
    height: '80%',
    width: '100%',
    position: 'absolute',
    bottom: 0,
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
  addButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  addButtonText: {
    color: Colors.dark.text,
    fontSize: 16,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  scrollContent: {
    flexGrow: 1,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.dark.icon,
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
    color: Colors.dark.text,
    backgroundColor: 'rgba(155, 161, 166, 0.1)',
  },
  removeButton: {
    padding: 4,
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.tint,
    borderRadius: 25,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  searchButtonText: {
    color: Colors.dark.background,
    fontSize: 16,
    fontWeight: '600',
  },
});