import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ThemedView as View } from '@/components/ThemedView';
import { ThemedText as Text } from '@/components/ThemedText';
import { TextInput, Button } from 'react-native';
import { StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { auth } from '@/lib/firebase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: username });
      // Auth state change will automatically redirect
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <View style={authStyles.container}>
      <Text style={authStyles.title}>Create Account</Text>
      {error ? <Text style={authStyles.error}>{error}</Text> : null}
      <TextInput
        style={authStyles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={authStyles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={authStyles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Sign Up" onPress={handleSignup} />
      <Button 
        title="Already have an account? Login" 
        onPress={() => router.push('/(auth)/login')}
      />
    </View>
  );
} 

const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
}); 