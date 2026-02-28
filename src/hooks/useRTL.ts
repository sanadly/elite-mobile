import { useTranslation } from 'react-i18next';

export function useRTL() {
  const { i18n } = useTranslation();
  return i18n.language === 'ar';
}

export function rtlChevron(isRTL: boolean): 'chevron-back' | 'chevron-forward' {
  return isRTL ? 'chevron-back' : 'chevron-forward';
}
