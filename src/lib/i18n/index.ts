import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './en.json';
import ar from './ar.json';

const LANGUAGE_KEY = '@elite_language';

const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

// Function to get stored language
const getStoredLanguage = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(LANGUAGE_KEY);
    return stored || Localization.getLocales()[0].languageCode || 'ar';
  } catch {
    return 'ar';
  }
};

// Function to store language
export const setStoredLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
  } catch (error) {
    console.error('Failed to store language:', error);
  }
};

// Initialize i18n
const initI18n = async () => {
  const language = await getStoredLanguage();
  const shouldBeRTL = RTL_LANGUAGES.includes(language);

  // Set RTL direction on app launch
  I18nManager.allowRTL(true);
  if (I18nManager.isRTL !== shouldBeRTL) {
    I18nManager.forceRTL(shouldBeRTL);
  }

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3',
      resources: {
        en: { translation: en },
        ar: { translation: ar },
      },
      lng: language,
      fallbackLng: 'ar',
      interpolation: {
        escapeValue: false,
      },
    });
};

// Initialize immediately
initI18n();

export { i18n };
export default i18n;
