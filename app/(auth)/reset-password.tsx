import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, AuthLanguageToggle } from '../../src/components/ui';
import { colors, typography, fonts, spacing, commonStyles } from '../../src/theme';
import { supabase } from '../../src/api/supabase';
import { useRTL } from '../../src/hooks/useRTL';

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!password || !confirmPassword) {
      setError(t('auth.reset_password.error.validation'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.reset_password.error.mismatch'));
      return;
    }

    if (password.length < 8) {
      setError(t('auth.reset_password.error.weak'));
      return;
    }

    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasUppercase || !hasLowercase || !hasNumber) {
      setError(t('auth.reset_password.error.complexity'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err) {
      if (err instanceof Error && err.message.includes('expired')) {
        setError(t('auth.reset_password.error.expired'));
      } else {
        setError(err instanceof Error ? err.message : t('auth.reset_password.error.network'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle-outline" size={48} color={colors.status.success.text} />
          </View>
          <Text style={[styles.successTitle, isRTL && commonStyles.rtlText]}>
            {t('auth.reset_password.success')}
          </Text>
          <Button
            title={t('auth.forgot_password.back_to_login')}
            onPress={() => router.replace('/(auth)/login')}
            size="lg"
            style={styles.primaryButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing[4] }]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <AuthLanguageToggle />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="key-outline" size={48} color={colors.primary.DEFAULT} />
            </View>
            <Text style={[styles.title, isRTL && commonStyles.rtlText]}>
              {t('auth.reset_password.title')}
            </Text>
            <Text style={[styles.subtitle, isRTL && commonStyles.rtlText]}>
              {t('auth.reset_password.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.reset_password.password_label')}
              placeholder={t('auth.reset_password.password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password-new"
            />

            <Input
              label={t('auth.reset_password.confirm_label')}
              placeholder={t('auth.reset_password.confirm_placeholder')}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoComplete="password-new"
            />

            {error ? <Text style={[styles.error, isRTL && commonStyles.rtlText]}>{error}</Text> : null}

            <Button
              title={loading ? t('auth.reset_password.loading') : t('auth.reset_password.submit')}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              style={styles.primaryButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing[6],
  },
  topBar: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[10],
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.muted.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  primaryButton: {
    marginTop: spacing[2],
  },
  error: {
    color: colors.destructive.DEFAULT,
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.muted.DEFAULT,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  successTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginBottom: spacing[8],
    textAlign: 'center',
  },
});
