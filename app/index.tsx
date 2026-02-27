import { useEffect, useState } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { View, Image, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { supabase } from '../src/api/supabase';
import { fetchUserProfile } from '../src/api/endpoints/profile';
import { mapProfileToUserData } from '../src/utils/profile';
import { colors } from '../src/theme';
import { usePreferencesStore } from '../src/store/preferencesStore';

const MIN_SPLASH_MS = 2500;
const AUTH_TIMEOUT_MS = 5000;

export default function Index() {
  const { user, setUser, setUserData, setSession, setLoading, loading } = useAuthStore();
  const [splashReady, setSplashReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const timer = setTimeout(() => setSplashReady(true), MIN_SPLASH_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let settled = false;

    const finishLoading = () => {
      if (!settled) {
        settled = true;
        setLoading(false);
      }
    };

    // Safety timeout — never hang on splash forever
    const timeout = setTimeout(() => {
      console.log('[Auth] Timeout reached, forcing navigation');
      finishLoading();
    }, AUTH_TIMEOUT_MS);

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('[Auth] getSession:', { hasSession: !!session, error: error?.message });

        if (error || !session) {
          // No valid session — go to login
          setSession(null);
          setUser(null);
          finishLoading();
          return;
        }

        setSession(session);
        setUser(session.user);

        // Fetch profile before finishing — ensures userData is set
        try {
          const profile = await fetchUserProfile();
          if (profile) setUserData(mapProfileToUserData(profile));
        } catch (err) {
          console.warn('[Auth] Profile fetch failed:', err);
        }

        finishLoading();
      } catch (err) {
        console.log('[Auth] Init error:', err);
        finishLoading();
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        try {
          const profile = await fetchUserProfile();
          if (profile) setUserData(mapProfileToUserData(profile));
        } catch (err) {
          console.warn('[Auth] Profile fetch on auth change failed:', err);
        }
      } else {
        setUserData(null);
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const hasSeenOnboarding = usePreferencesStore((s) => s.hasSeenOnboarding);
  const prefsHydrated = usePreferencesStore((s) => s._hasHydrated);

  useEffect(() => {
    if (loading || !splashReady || !prefsHydrated) return;

    // Show onboarding on first launch
    if (!hasSeenOnboarding) {
      router.replace('/onboarding');
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && !inAuthGroup && !inTabsGroup) {
      // Allow guests to browse — send them to tabs instead of login
      router.replace('/(tabs)');
    } else if (user && !inTabsGroup) {
      router.replace('/(tabs)');
    }
  }, [user, segments, loading, splashReady, hasSeenOnboarding, prefsHydrated]);

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
    width: 360,
    height: 200,
  },
});
