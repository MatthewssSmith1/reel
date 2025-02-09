import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { TextInput, TouchableOpacity, Animated, View } from 'react-native';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { ThemedText as Text } from '@/components/ThemedText';
import { authStyles, useKeyboardPadding } from './_layout';
import { auth, db } from '@/lib/firebase';
import { useState } from 'react';
import { router } from 'expo-router';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const paddingBottom = useKeyboardPadding();

  const handleSignup = async () => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(user, { displayName: username });
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/png?seed=${username}`,
        bio: '',
        created_at: Timestamp.now(),
        followers_count: 0,
        following_count: 0,
        posts_count: 0
      });
    } catch (err) {
      setError('Failed to create account. Please try again.');
    }
  };

  return (
    <Animated.View style={[authStyles.container, { paddingBottom }]}>
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
      <View style={authStyles.buttonContainer}>
        <TouchableOpacity style={authStyles.button} onPress={handleSignup}>
          <Text style={authStyles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
        <Text style={authStyles.textLink}>Have an account? Log in</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}