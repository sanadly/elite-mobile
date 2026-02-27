import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

/**
 * Redirects unauthenticated users to the login screen.
 * Use at the top of any screen that requires authentication.
 */
export function useRequireAuth(): boolean {
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
    }
  }, [user, router]);

  return !!user;
}
