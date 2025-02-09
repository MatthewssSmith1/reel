import { TextInput, TouchableOpacity, Animated, View } from 'react-native';
import { authStyles, useKeyboardPadding } from './_layout';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ThemedText as Text } from '@/components/ThemedText';
import { useState } from 'react';
import { router } from 'expo-router';
import { auth } from '@/lib/firebase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const paddingBottom = useKeyboardPadding();

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
    }
  };

  return (
    <Animated.View style={[authStyles.container, { paddingBottom }]}>
      <Text style={authStyles.title}>Welcome Back</Text>
      {error ? <Text style={authStyles.error}>{error}</Text> : null}
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
      <View style={authStyles.buttonContainer}>
        <TouchableOpacity style={authStyles.button} onPress={handleLogin}>
          <Text style={authStyles.buttonText}>Log in</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
        <Text style={authStyles.textLink}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}