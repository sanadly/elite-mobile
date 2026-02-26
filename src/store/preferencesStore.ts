import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { reloadAppAsync } from 'expo';
import i18n, { setStoredLanguage } from '../lib/i18n';

type Language = 'en' | 'ar';

interface PreferencesState {
  language: Language;
  isRTL: boolean;
  setLanguage: (language: Language) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      language: 'ar',
      isRTL: true,

      setLanguage: async (language: Language) => {
        const currentLanguage = get().language;

        // If language hasn't changed, do nothing
        if (currentLanguage === language) {
          return;
        }

        const shouldBeRTL = language === 'ar';
        const currentIsRTL = I18nManager.isRTL;

        // Update i18n
        await i18n.changeLanguage(language);
        await setStoredLanguage(language);

        // Update store
        set({ language, isRTL: shouldBeRTL });

        // If RTL direction changed, we need to reload the app
        if (shouldBeRTL !== currentIsRTL) {
          I18nManager.forceRTL(shouldBeRTL);
          await reloadAppAsync('RTL direction changed');
        }
      },
    }),
    {
      name: 'elite-preferences',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
