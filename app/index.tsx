import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { supabase } from '../src/api/supabase';
import { fetchUserProfile } from '../src/api/endpoints/profile';
import { colors } from '../src/theme';

const MIN_SPLASH_MS = 2500;

export default function Index() {
  const { user, setUser, setUserData, setSession, setLoading, loading } = useAuthStore();
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
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profile = await fetchUserProfile();
        if (profile) {
          setUserData({
            id: profile.id,
            uid: profile.uid,
            name: profile.name,
            email: profile.email,
            phone: profile.phone || undefined,
            city: profile.city || undefined,
            role: profile.role,
            loyaltyTier: profile.loyaltyTier,
            totalSpend: profile.totalSpend,
          });
        }
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const profile = await fetchUserProfile();
        if (profile) {
          setUserData({
            id: profile.id,
            uid: profile.uid,
            name: profile.name,
            email: profile.email,
            phone: profile.phone || undefined,
            city: profile.city || undefined,
            role: profile.role,
            loyaltyTier: profile.loyaltyTier,
            totalSpend: profile.totalSpend,
          });
        }
      } else {
        setUserData(null);
      }
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
