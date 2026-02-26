import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, fonts, spacing } from '../../theme';
import { Button } from './Button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Ionicons name="alert-circle-outline" size={48} color={colors.muted.foreground} />
      <Text style={styles.message}>
        {message || t('errors.generic')}
      </Text>
      {onRetry && (
        <Button
          title={t('errors.try_again')}
          onPress={onRetry}
          variant="outline"
          size="sm"
          style={styles.retryButton}
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
    gap: spacing[3],
  },
  message: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: spacing[2],
  },
});
