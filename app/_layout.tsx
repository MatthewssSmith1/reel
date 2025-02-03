import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useColorScheme } from '@/hooks/useColorScheme';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import 'react-native-reanimated';

SplashScreen.preventAutoHideAsync();

function AuthGuard() {
  const { isLoading } = useProtectedRoute();
  const colorScheme = useColorScheme();

  if (isLoading) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Slot />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    <AuthProvider>
      <AuthGuard />
    </AuthProvider>
  );
}
