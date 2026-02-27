import { useEffect, useState } from 'react';
import { I18nManager } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from '@expo-google-fonts/alexandria/useFonts';
import {
  Alexandria_300Light,
  Alexandria_400Regular,
  Alexandria_500Medium,
  Alexandria_600SemiBold,
  Alexandria_700Bold,
} from '@expo-google-fonts/alexandria';
import * as SplashScreen from 'expo-splash-screen';
import { i18nReady } from '../src/lib/i18n';
import { NetworkBanner } from '../src/components/feedback';
import { ErrorBoundary } from '../src/components/ui';
import { colors, fonts } from '../src/theme';

// Keep native splash visible until we're ready
SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({ duration: 600, fade: true });

const queryClient = new QueryClient();

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Alexandria_300Light,
    Alexandria_400Regular,
    Alexandria_500Medium,
    Alexandria_600SemiBold,
    Alexandria_700Bold,
  });

  useEffect(() => {
    i18nReady.then(() => setIsReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && isReady) {
      SplashScreen.hide();
    }
  }, [fontsLoaded, fontError, isReady]);

  if ((!fontsLoaded && !fontError) || !isReady) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <SafeAreaProvider>
          <NetworkBanner />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: colors.primary.DEFAULT },
              headerTintColor: colors.primary.foreground,
              headerTitleStyle: { fontFamily: fonts.semibold },
              headerBackButtonDisplayMode: 'minimal',
              animation: I18nManager.isRTL ? 'slide_from_left' : 'slide_from_right',
            }}
          >
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="products/index" options={{ headerShown: false }} />
            <Stack.Screen name="order-success" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
      </QueryClientProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
