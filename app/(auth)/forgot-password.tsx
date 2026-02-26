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

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!email) {
      setError(t('auth.forgot_password.error.validation'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'elitestyle://reset-password',
      });

      if (resetError) throw resetError;

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.forgot_password.error.network'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-outline" size={48} color={colors.primary.DEFAULT} />
          </View>
          <Text style={[styles.successTitle, isRTL && commonStyles.rtlText]}>
            {t('auth.forgot_password.success_title')}
          </Text>
          <Text style={[styles.successText, isRTL && commonStyles.rtlText]}>
            {t('auth.forgot_password.success_message')}
          </Text>
          <Button
            title={t('auth.forgot_password.back_to_login')}
            onPress={() => router.back()}
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
              <Ionicons name="lock-closed-outline" size={48} color={colors.primary.DEFAULT} />
            </View>
            <Text style={[styles.title, isRTL && commonStyles.rtlText]}>
              {t('auth.forgot_password.title')}
            </Text>
            <Text style={[styles.subtitle, isRTL && commonStyles.rtlText]}>
              {t('auth.forgot_password.subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.forgot_password.email_label')}
              placeholder={t('auth.forgot_password.email_placeholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {error ? <Text style={[styles.error, isRTL && commonStyles.rtlText]}>{error}</Text> : null}

            <Button
              title={loading ? t('auth.forgot_password.loading') : t('auth.forgot_password.submit')}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
              style={styles.primaryButton}
            />

            <Button
              title={t('auth.forgot_password.back_to_login')}
              onPress={() => router.back()}
              variant="outline"
              size="lg"
              style={styles.backButton}
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
  backButton: {
    marginTop: spacing[3],
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
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  successText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
    marginBottom: spacing[8],
    lineHeight: 22,
  },
});
