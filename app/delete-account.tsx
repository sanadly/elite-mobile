import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button, Input, Row } from '../src/components/ui';
import { useAuthStore } from '../src/store/authStore';
import { useRequireAuth } from '../src/hooks/useRequireAuth';
import { deleteAccount } from '../src/api/endpoints/account';
import { supabase } from '../src/api/supabase';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../src/theme';
import { useRTL } from '../src/hooks/useRTL';

export default function DeleteAccountScreen() {
  const isAuthenticated = useRequireAuth();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isAuthenticated) return null;

  const handleDelete = () => {
    Alert.alert(
      t('account.delete.confirm_title'),
      t('account.delete.confirm_message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('account.delete.confirm_button'),
          style: 'destructive',
          onPress: performDelete,
        },
      ],
    );
  };

  const performDelete = async () => {
    if (!password.trim()) {
      setError(t('account.delete.password_required'));
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      // Re-authenticate to verify identity
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password,
      });

      if (signInError) {
        setError(t('account.delete.wrong_password'));
        setIsDeleting(false);
        return;
      }

      // Call the delete account API
      await deleteAccount();

      // Clear local state and navigate to login
      await logout();
      router.replace('/(auth)/login');
    } catch (err) {
      setError(t('account.delete.error'));
      setIsDeleting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: t('account.delete.title') }} />
      <View style={styles.content}>
        <View style={styles.warningCard}>
          <Ionicons name="warning" size={48} color={colors.destructive.DEFAULT} />
          <Text style={[styles.warningTitle, isRTL && commonStyles.rtlText]}>
            {t('account.delete.warning_title')}
          </Text>
          <Text style={[styles.warningText, isRTL && commonStyles.rtlText]}>
            {t('account.delete.warning_message')}
          </Text>
        </View>

        <View style={styles.bulletList}>
          {['orders', 'addresses', 'profile', 'loyalty'].map((item) => (
            <Row key={item} style={styles.bulletItem} gap={spacing[2]}>
              <Ionicons name="close-circle" size={18} color={colors.destructive.DEFAULT} />
              <Text style={[styles.bulletText, isRTL && commonStyles.rtlText]}>
                {t(`account.delete.lose_${item}`)}
              </Text>
            </Row>
          ))}
        </View>

        <View style={styles.passwordSection}>
          <Text style={[styles.passwordLabel, isRTL && commonStyles.rtlText]}>
            {t('account.delete.enter_password')}
          </Text>
          <Input
            placeholder={t('auth.login.password_placeholder')}
            value={password}
            onChangeText={(text) => { setPassword(text); setError(''); }}
            secureTextEntry
            error={error}
          />
        </View>

        <Button
          title={isDeleting ? t('account.delete.deleting') : t('account.delete.button')}
          onPress={handleDelete}
          loading={isDeleting}
          disabled={isDeleting || !password.trim()}
          size="lg"
          style={styles.deleteButton}
          variant="outline"
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing[4],
  },
  warningCard: {
    alignItems: 'center',
    padding: spacing[6],
    backgroundColor: colors.destructive.DEFAULT + '0D',
    borderRadius: radius.lg,
    marginBottom: spacing[6],
  },
  warningTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: fonts.bold,
    color: colors.destructive.DEFAULT,
    marginTop: spacing[3],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
    lineHeight: 20,
  },
  bulletList: {
    marginBottom: spacing[6],
  },
  bulletItem: {
    marginBottom: spacing[3],
  },
  bulletText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.foreground,
    flex: 1,
  },
  passwordSection: {
    marginBottom: spacing[6],
  },
  passwordLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.foreground,
    marginBottom: spacing[2],
  },
  deleteButton: {
    borderColor: colors.destructive.DEFAULT,
    marginBottom: spacing[8],
  },
});
