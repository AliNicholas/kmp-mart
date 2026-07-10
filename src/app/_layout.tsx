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

cssInterop(Image, { className: 'style' });

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
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
  );
}


