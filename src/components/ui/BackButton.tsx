import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRTL } from '../../hooks/useRTL';
import { colors, shadows } from '../../theme';

const CONTAINER_SIZE = 40;
const ICON_SIZE = 24;
const HIT_SLOP = 12;

interface BackButtonProps {
  variant?: 'floating' | 'inline';
  onPress?: () => void;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function BackButton({
  variant = 'inline',
  onPress,
  color,
  style,
}: BackButtonProps) {
  const router = useRouter();
  const isRTL = useRTL();

  const iconName = isRTL ? 'chevron-forward' : 'chevron-back';
  const defaultColor =
    variant === 'floating' ? colors.primary.DEFAULT : colors.foreground;
  const iconColor = color ?? defaultColor;

  const handlePress = onPress ?? (() => router.back());

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={HIT_SLOP}
      accessibilityRole="button"
      accessibilityLabel="Go back"
      style={[
        styles.container,
        variant === 'floating' && styles.floating,
        style,
      ]}
    >
      <Ionicons
        name={iconName}
        size={ICON_SIZE}
        color={iconColor}
        style={isRTL ? styles.nudgeRTL : styles.nudgeLTR}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: CONTAINER_SIZE,
    height: CONTAINER_SIZE,
    borderRadius: CONTAINER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floating: {
    backgroundColor: colors.overlay.light90,
    ...shadows.subtle,
  },
  nudgeLTR: {
    marginLeft: -1,
  },
  nudgeRTL: {
    marginRight: -1,
  },
});
