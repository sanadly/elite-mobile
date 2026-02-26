import React, { useState } from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../store/preferencesStore';
import { colors, spacing, typography, fonts } from '../../theme';

export function AuthLanguageToggle() {
  const { i18n } = useTranslation();
  const setLanguage = usePreferencesStore((s) => s.setLanguage);
  const [switching, setSwitching] = useState(false);
  const language = i18n.language;

  const handleToggle = async () => {
    if (switching) return;
    setSwitching(true);
    try {
      const next = language === 'en' ? 'ar' : 'en';
      await setLanguage(next);
    } catch (err) {
      console.warn('Language switch failed:', err);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [styles.toggle, pressed && styles.pressed]}
      onPress={handleToggle}
      disabled={switching}
    >
      <Text style={[styles.label, language === 'en' && styles.activeLabel]}>
        EN
      </Text>
      <Text style={styles.divider}>|</Text>
      <Text style={[styles.label, language === 'ar' && styles.activeLabel]}>
        {'\u0639\u0631\u0628\u064A'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pressed: {
    opacity: 0.7,
    backgroundColor: colors.muted.DEFAULT,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
  },
  activeLabel: {
    color: colors.primary.DEFAULT,
    fontFamily: fonts.bold,
  },
  divider: {
    fontSize: typography.fontSize.sm,
    color: colors.border,
    marginHorizontal: spacing[2],
  },
});
