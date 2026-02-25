import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../src/components/settings/LanguageSwitcher';
import { colors, typography, fonts, spacing } from '../src/theme';
import { useRTL } from '../src/hooks/useRTL';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();

  return (
    <ScrollView style={styles.container}>
      {/* Header with back button */}
      <View style={[styles.header, isRTL && styles.headerRTL]}>
        <Pressable onPress={() => router.back()} style={[styles.backButton, isRTL && styles.backButtonRTL]}>
          <Ionicons name={isRTL ? 'arrow-forward' : 'arrow-back'} size={24} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t('account.menu.language')}</Text>
      </View>

      {/* Language Switcher */}
      <LanguageSwitcher />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    marginRight: spacing[3],
  },
  backButtonRTL: {
    marginRight: 0,
    marginLeft: spacing[3],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
