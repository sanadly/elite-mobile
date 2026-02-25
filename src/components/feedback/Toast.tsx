import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { colors, typography, fonts, spacing } from '../../theme';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onHide?: () => void;
  visible: boolean;
}

const TOAST_CONFIG = {
  success: {
    icon: 'checkmark-circle' as const,
    color: colors.status.success.text,
    bg: colors.status.success.bg,
  },
  error: {
    icon: 'close-circle' as const,
    color: colors.status.error.text,
    bg: colors.status.error.bg,
  },
  warning: {
    icon: 'warning' as const,
    color: colors.status.warning.text,
    bg: colors.status.warning.bg,
  },
  info: {
    icon: 'information-circle' as const,
    color: colors.primary.DEFAULT,
    bg: colors.muted.DEFAULT,
  },
};

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onHide,
  visible,
}: ToastProps) {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const config = TOAST_CONFIG[type];

  useEffect(() => {
    if (visible) {
      // Show toast
      opacity.value = withTiming(1, { duration: 200 });
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });

      // Auto hide after duration
      const timeout = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timeout);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    opacity.value = withTiming(0, { duration: 200 });
    translateY.value = withTiming(-100, { duration: 200 }, () => {
      if (onHide) {
        runOnJS(onHide)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        style={[styles.toast, { backgroundColor: config.bg }]}
        onPress={hideToast}
      >
        <Ionicons name={config.icon} size={24} color={config.color} />
        <Text style={[styles.message, { color: config.color }]} numberOfLines={2}>
          {message}
        </Text>
        <Pressable onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={20} color={config.color} />
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing[4],
    right: spacing[4],
    zIndex: 9999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: fonts.medium,
    marginLeft: spacing[3],
  },
  closeButton: {
    padding: spacing[1],
    marginLeft: spacing[2],
  },
});
