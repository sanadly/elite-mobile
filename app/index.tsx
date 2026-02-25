import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { supabase } from '../src/api/supabase';
import { colors } from '../src/theme';

const MIN_SPLASH_MS = 2500;

export default function Index() {
  const { user, setUser, setSession, setLoading, loading } = useAuthStore();
  const [splashReady, setSplashReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Minimum splash display time
    const timer = setTimeout(() => setSplashReady(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (loading || !splashReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, loading, splashReady]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/logo/logo-splash.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary.DEFAULT,
  },
  logo: {
    width: 280,
    height: 160,
  },
});
