import { StyleSheet, View, Modal, TouchableOpacity, Pressable } from 'react-native';
import { ThemedText as Text } from '@/components/ThemedText';
import React, { useState } from 'react';
import { useRecipeStore } from '@/lib/recipeStore';
import { Ionicons } from '@expo/vector-icons';

export function RecipeActionMenu() {
  const { currentRecipe, resetRecipe, flashChanges } = useRecipeStore();
  const [menuVisible, setMenuVisible] = useState(false);

  if (!currentRecipe?.parent_id) return null;

  return (
    <>
      <TouchableOpacity 
        style={styles.hamburgerButton}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="menu" size={24} color="#fff" />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <ActionButton
              icon="refresh"
              label="Reset to Original"
              onPress={() => {
                resetRecipe();
                setMenuVisible(false);
              }}
            />
            <ActionButton
              icon="flash"
              label="Show Changes"
              onPress={() => {
                flashChanges();
                setMenuVisible(false);
              }}
            />
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

type IconName = keyof typeof Ionicons.glyphMap;

function ActionButton({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void; }) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed
      ]}
      onPress={onPress}
    >
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={styles.menuText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hamburgerButton: {
    position: 'absolute',
    top: 13,
    right: 13,
    zIndex: 1,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#222',
    borderRadius: 12,
    padding: 8,
    width: '80%',
    maxWidth: 300,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 8,
  },
  menuItemPressed: {
    backgroundColor: '#444',
  },
  menuText: {
    color: '#fff',
    fontSize: 16,
  },
}); 