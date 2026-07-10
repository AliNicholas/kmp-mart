import '@/global.css';

import { ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AppProvider } from '@/contexts/AppContext';
import { NAV_THEME } from '@/lib/theme';

import { PortalHost } from '@rn-primitives/portal';
import { cssInterop } from 'nativewind';
import { Image } from 'expo-image';
import { SafeAreaProvider } from 'react-native-safe-area-context';

cssInterop(Image, { className: 'style' });

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <ThemeProvider value={NAV_THEME[colorScheme === 'dark' ? 'dark' : 'light']}>
        <AppProvider>
          <AnimatedSplashOverlay />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="explore" />
          </Stack>
          <PortalHost />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

