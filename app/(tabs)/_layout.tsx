import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { I18nManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts } from '../../src/theme';

export default function TabsLayout() {
  const { t } = useTranslation();
  const isRTL = I18nManager.isRTL;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary.DEFAULT,
        tabBarInactiveTintColor: colors.muted.foreground,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.background,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
        headerStyle: {
          backgroundColor: colors.primary.DEFAULT,
        },
        headerTintColor: colors.primary.foreground,
        headerTitleStyle: {
          fontFamily: fonts.semibold,
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          writingDirection: isRTL ? 'rtl' : 'ltr',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.shop'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('tabs.cart'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: t('tabs.account'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
