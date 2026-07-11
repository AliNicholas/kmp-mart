import '@/global.css';

import { ThemeProvider, Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View, Platform } from 'react-native';

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

  const content = (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="explore" />
      </Stack>
      <PortalHost />
    </>
  );

  return (
    <SafeAreaProvider>
      <ThemeProvider value={NAV_THEME[colorScheme === 'dark' ? 'dark' : 'light']}>
        <AppProvider>
          <AnimatedSplashOverlay />
          {Platform.OS === 'web' ? (
            <View style={{ flex: 1, backgroundColor: '#0c0a09', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ 
                width: '100%', 
                maxWidth: 460, 
                height: '100%', 
                backgroundColor: '#ffffff',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 10 },
                shadowOpacity: 0.3,
                shadowRadius: 20,
                elevation: 10,
                overflow: 'hidden'
              }}>
                {content}
              </View>
            </View>
          ) : (
            content
          )}
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

