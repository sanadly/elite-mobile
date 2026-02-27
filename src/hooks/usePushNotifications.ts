import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';
import { apiFetch } from '../api/client';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

async function registerForPushNotificationsAsync(): Promise<string | null> {
  // Push notifications only work on physical devices
  if (!Device.isDevice) {
    console.log('[Push] Not a physical device, skipping registration');
    return null;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#012856',
    });

    await Notifications.setNotificationChannelAsync('orders', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#012856',
    });
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permission if not already granted
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('[Push] Permission not granted');
    return null;
  }

  // Get the Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenResponse = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  return tokenResponse.data;
}

async function sendTokenToServer(token: string) {
  try {
    await apiFetch('/api/mobile/device-tokens', {
      requireAuth: true,
      method: 'POST',
      body: {
        token,
        platform: Platform.OS,
      },
    });
  } catch (err) {
    console.warn('[Push] Failed to register token with server:', err);
  }
}

async function deactivateTokenOnServer(token: string) {
  try {
    await apiFetch('/api/mobile/device-tokens', {
      requireAuth: true,
      method: 'DELETE',
      body: { token },
    });
  } catch (err) {
    console.warn('[Push] Failed to deactivate token:', err);
  }
}

/**
 * Hook to set up push notifications.
 * - Requests permission and registers the device token on mount (when authenticated)
 * - Handles notification taps (navigates to orders/products)
 * - Deactivates the token on logout
 */
export function usePushNotifications() {
  const { user } = useAuthStore();
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);

  // Register for push notifications when the user is authenticated
  useEffect(() => {
    if (!user) return;

    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        tokenRef.current = token;
        sendTokenToServer(token);
      }
    });
  }, [user?.id]);

  // Handle notification taps (when user taps a notification)
  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data;

        if (data?.orderId) {
          router.push(`/orders/${data.orderId}` as any);
        } else if (data?.productId) {
          router.push(`/product/${data.productId}` as any);
        } else {
          router.push('/notifications' as any);
        }
      },
    );

    return () => subscription.remove();
  }, [router]);

  // Deactivate token when user logs out
  useEffect(() => {
    if (!user && tokenRef.current) {
      deactivateTokenOnServer(tokenRef.current);
      tokenRef.current = null;
    }
  }, [user]);
}
