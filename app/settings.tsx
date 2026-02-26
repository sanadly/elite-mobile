import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '../src/components/settings/LanguageSwitcher';
import { colors } from '../src/theme';

export default function SettingsScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: t('account.menu.language') }} />
      <LanguageSwitcher />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
