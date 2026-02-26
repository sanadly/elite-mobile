import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing } from '../../theme';
import { Button } from './Button';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction, style }: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <Ionicons name={icon} size={80} color={colors.muted.foreground} />
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          size="lg"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  title: {
    fontSize: 24,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    marginTop: spacing[4],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  button: {
    width: '100%',
    maxWidth: 300,
  },
});
