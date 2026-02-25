import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  style?: ViewStyle;
}

export function Card({ children, variant = 'default', style }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.card.DEFAULT,
    borderRadius: radius.lg,
    padding: 16, // p-4 (spacing[4])
  },
  default: {
    ...shadows.minimal,
  },
  elevated: {
    ...shadows.subtle,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
