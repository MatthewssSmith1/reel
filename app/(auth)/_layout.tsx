import { useKeyboardVisibility } from '@/hooks/useKeyboardVisibility';
import { StyleSheet, Animated } from 'react-native';
import { useState, useEffect } from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}

export function useKeyboardPadding() {
  const isKeyboardVisible = useKeyboardVisibility();
  const paddingAnim = useState(() => new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(paddingAnim, {
      toValue: isKeyboardVisible ? 100 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isKeyboardVisible]);

  return paddingAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '60%']
  });
}

export const authStyles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 6,
    paddingHorizontal: 16,
    paddingBottom: 100,
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginBottom: 12,
    paddingHorizontal: 8,
    color: 'white',
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 6,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: '500',
  },
  textLink: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  }
});