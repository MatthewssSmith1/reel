import { StyleSheet, TextInput, Pressable } from 'react-native'
import { ThemedText as Text } from '@/components/ThemedText'
import { ThemedView as View } from '@/components/ThemedView'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useUserStore } from '@/lib/userStore'
import { useState } from 'react'
import { router } from 'expo-router'

export default function EditProfileModal() {
  const { authUser, updateBio } = useUserStore()
  const [bio, setBio] = useState(authUser?.bio || '')
  const hasChanges = bio !== authUser?.bio

  const handleSave = async () => {
    if (!authUser || !hasChanges) return
    
    try {
      await updateBio(authUser.uid, bio)
      router.back()
    } catch (error) {
      console.error('Failed to update bio:', error)
    }
  }

  if (!authUser) return null

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </Pressable>
        <Text style={styles.title}>Edit Profile</Text>
        <Pressable onPress={handleSave} disabled={!hasChanges}>
          <Text style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}>
            Save
          </Text>
        </Pressable>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={styles.input}
          placeholder="Add a bio"
          placeholderTextColor="#666"
          multiline
          maxLength={150}
        />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
  },
  input: {
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1c1c1e',
    color: '#fff',
    minHeight: 100,
  },
}) 