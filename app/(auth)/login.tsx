import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Input, AuthLanguageToggle } from '../../src/components/ui';
import { colors, typography, fonts, spacing } from '../../src/theme';
import { supabase } from '../../src/api/supabase';
import { useAuthStore } from '../../src/store/authStore';
import { useRTL } from '../../src/hooks/useRTL';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { setUser, setSession } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('checkout.error.validation'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err.message || t('auth.login.error.invalid_credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.topBar}>
          <AuthLanguageToggle />
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/logo/header-logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.welcome, isRTL && styles.rtlText]}>{t('auth.login.title')}</Text>
          </View>

          <View style={styles.form}>
            <Input
              label={t('auth.login.email_label')}
              placeholder={t('auth.login.email_placeholder')}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <Input
              label={t('auth.login.password_label')}
              placeholder={t('auth.login.password_placeholder')}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />

            {error ? <Text style={[styles.error, isRTL && styles.rtlText]}>{error}</Text> : null}

            <Button
              title={loading ? t('auth.login.loading') : t('auth.login.submit')}
              onPress={handleLogin}
              loading={loading}
              size="lg"
              style={styles.primaryButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t('common.or') || 'or'}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Button
              title={t('auth.login.create_account')}
              onPress={() => router.push('/(auth)/register')}
              variant="outline"
              size="lg"
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
    paddingTop: spacing[16],
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
  logo: {
    width: 200,
    height: 70,
    marginBottom: spacing[4],
  },
  welcome: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.regular,
    color: colors.foreground,
    lineHeight: 30,
  },
  form: {
    width: '100%',
  },
  primaryButton: {
    marginTop: spacing[2],
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing[5],
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginHorizontal: spacing[4],
  },
  error: {
    color: colors.destructive.DEFAULT,
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
