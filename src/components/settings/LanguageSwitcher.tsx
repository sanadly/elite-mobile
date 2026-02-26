import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { usePreferencesStore } from '../../store/preferencesStore';
import { colors, typography, fonts, spacing, commonStyles } from '../../theme';
import { useRTL } from '../../hooks/useRTL';

export function LanguageSwitcher() {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { language, setLanguage } = usePreferencesStore();
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (newLanguage: 'en' | 'ar') => {
    if (newLanguage === language || isChanging) return;

    Alert.alert(
      t('common.confirm'),
      newLanguage === 'ar'
        ? '\u0633\u064A\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u062A\u0634\u063A\u064A\u0644 \u0627\u0644\u062A\u0637\u0628\u064A\u0642 \u0644\u062A\u0637\u0628\u064A\u0642 \u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629'
        : 'The app will reload to apply the language change',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.confirm'),
          onPress: async () => {
            setIsChanging(true);
            try {
              await setLanguage(newLanguage);
            } catch (error) {
              console.error('Failed to change language:', error);
              setIsChanging(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && commonStyles.rtlText]}>{t('account.menu.language')}</Text>

      <View style={styles.options}>
        <Pressable
          style={[styles.option, isRTL && styles.optionRTL, language === 'en' && styles.optionActive]}
          onPress={() => handleLanguageChange('en')}
          disabled={isChanging}
        >
          <View style={styles.optionContent}>
            <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>English</Text>
            <Text style={[styles.optionSubtext, language === 'en' && styles.optionSubtextActive]}>English</Text>
          </View>
          {language === 'en' && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary.DEFAULT} />
          )}
        </Pressable>

        <Pressable
          style={[styles.option, isRTL && styles.optionRTL, language === 'ar' && styles.optionActive]}
          onPress={() => handleLanguageChange('ar')}
          disabled={isChanging}
        >
          <View style={styles.optionContent}>
            <Text style={[styles.optionText, language === 'ar' && styles.optionTextActive, isRTL && commonStyles.rtlText]}>
              {'\u0627\u0644\u0639\u0631\u0628\u064A\u0629'}
            </Text>
            <Text style={[styles.optionSubtext, language === 'ar' && styles.optionSubtextActive, isRTL && commonStyles.rtlText]}>
              Arabic
            </Text>
          </View>
          {language === 'ar' && (
            <Ionicons name="checkmark-circle" size={24} color={colors.primary.DEFAULT} />
          )}
        </Pressable>
      </View>

      {isChanging && (
        <Text style={styles.loadingText}>
          {language === 'en' ? 'Changing language...' : '\u062C\u0627\u0631\u064A \u062A\u063A\u064A\u064A\u0631 \u0627\u0644\u0644\u063A\u0629...'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: spacing[4] },
  title: { fontSize: typography.fontSize.lg, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[4] },
  options: { gap: spacing[3] },
  option: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing[4], borderRadius: 12, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.background },
  optionRTL: { flexDirection: 'row-reverse' },
  optionActive: { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.DEFAULT + '08' },
  optionContent: { flex: 1 },
  optionText: { fontSize: typography.fontSize.base, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[1] },
  optionTextActive: { color: colors.primary.DEFAULT },
  optionSubtext: { fontSize: typography.fontSize.sm, fontFamily: fonts.regular, color: colors.muted.foreground },
  optionSubtextActive: { color: colors.primary.DEFAULT },
  loadingText: { fontSize: typography.fontSize.sm, fontFamily: fonts.regular, color: colors.muted.foreground, textAlign: 'center', marginTop: spacing[4] },
});
