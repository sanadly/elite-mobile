import React, { useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Dimensions,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';
import { Button } from '../src/components/ui';
import { fonts, typography, spacing, radius } from '../src/theme';
import { usePreferencesStore } from '../src/store/preferencesStore';
import { useRTL } from '../src/hooks/useRTL';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Dark luxury theme colors
const DARK_BG = '#0F1724';
const CARD_BG = 'rgba(255,255,255,0.06)';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = 'rgba(255,255,255,0.65)';
const ACCENT_GOLD = '#C9A96E';
const DOT_ACTIVE = '#FFFFFF';
const DOT_INACTIVE = 'rgba(255,255,255,0.25)';

// --- Welcome Page ---
function WelcomePage({ onContinue }: { onContinue: () => void }) {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const insets = useSafeAreaInsets();

  const features = [
    { icon: 'diamond-outline' as const, titleKey: 'feature_1_title', subtitleKey: 'feature_1_subtitle', delay: 600 },
    { icon: 'gift-outline' as const, titleKey: 'feature_2_title', subtitleKey: 'feature_2_subtitle', delay: 700 },
    { icon: 'shield-checkmark-outline' as const, titleKey: 'feature_3_title', subtitleKey: 'feature_3_subtitle', delay: 800 },
  ];

  return (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing[8] }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.logoContainer}>
          <Image
            source={require('../assets/images/logo/header-logo-white.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInUp.duration(600).delay(200)}
          style={[styles.title, isRTL && styles.rtlText]}
        >
          {t('onboarding.welcome.title')}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInUp.duration(600).delay(400)}
          style={[styles.subtitle, isRTL && styles.rtlText]}
        >
          {t('onboarding.welcome.subtitle')}
        </Animated.Text>

        {/* Why Us Section */}
        <Animated.Text
          entering={FadeInUp.duration(600).delay(500)}
          style={[styles.sectionTitle, isRTL && styles.rtlText]}
        >
          {t('onboarding.welcome.why_us')}
        </Animated.Text>

        {/* Feature Cards */}
        {features.map((feature, index) => (
          <Animated.View
            key={index}
            entering={FadeInUp.duration(500).delay(feature.delay)}
            style={[styles.featureRow, isRTL && styles.featureRowRTL]}
          >
            <View style={styles.featureIcon}>
              <Ionicons name={feature.icon} size={24} color={ACCENT_GOLD} />
            </View>
            <View style={styles.featureText}>
              <Text style={[styles.featureTitle, isRTL && styles.rtlText]}>
                {t(`onboarding.welcome.${feature.titleKey}`)}
              </Text>
              <Text style={[styles.featureSubtitle, isRTL && styles.rtlText]}>
                {t(`onboarding.welcome.${feature.subtitleKey}`)}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCTA, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Button
          title={t('onboarding.welcome.continue')}
          onPress={onContinue}
          size="lg"
          style={styles.primaryButton}
          textStyle={styles.primaryButtonText}
        />
      </View>
    </View>
  );
}

// --- Notification Page ---
function NotificationPage({ onComplete }: { onComplete: () => void }) {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const insets = useSafeAreaInsets();
  const [requesting, setRequesting] = useState(false);

  const handleEnableNotifications = async () => {
    setRequesting(true);
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
        });
      }
      await Notifications.requestPermissionsAsync();
    } catch (err) {
      console.warn('[Onboarding] Notification permission error:', err);
    } finally {
      setRequesting(false);
      onComplete();
    }
  };

  return (
    <View style={[styles.page, { width: SCREEN_WIDTH }]}>
      <View style={[styles.centeredContent, { paddingTop: insets.top + spacing[16] }]}>
        {/* Bell Icon */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.bellContainer}>
          <View style={styles.bellCircle}>
            <Ionicons name="notifications" size={56} color={ACCENT_GOLD} />
          </View>
        </Animated.View>

        {/* Title */}
        <Animated.Text
          entering={FadeInUp.duration(600).delay(200)}
          style={[styles.title, isRTL && styles.rtlText]}
        >
          {t('onboarding.notifications.title')}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInUp.duration(600).delay(400)}
          style={[styles.subtitle, styles.notifSubtitle, isRTL && styles.rtlText]}
        >
          {t('onboarding.notifications.subtitle')}
        </Animated.Text>
      </View>

      {/* Bottom CTAs */}
      <View style={[styles.bottomCTA, { paddingBottom: insets.bottom + spacing[4] }]}>
        <Button
          title={t('onboarding.notifications.enable')}
          onPress={handleEnableNotifications}
          loading={requesting}
          size="lg"
          style={styles.primaryButton}
          textStyle={styles.primaryButtonText}
        />
        <Pressable onPress={onComplete} style={styles.skipButton}>
          <Text style={styles.skipText}>{t('onboarding.notifications.not_now')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

// --- Main Onboarding Screen ---
export default function OnboardingScreen() {
  const flatListRef = useRef<FlatList>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const router = useRouter();

  const completeOnboarding = useCallback(() => {
    usePreferencesStore.getState().setHasSeenOnboarding(true);
    router.replace('/(tabs)');
  }, [router]);

  const goToNextPage = useCallback(() => {
    flatListRef.current?.scrollToIndex({ index: 1, animated: true });
  }, []);

  const pages = [
    { key: 'welcome' },
    { key: 'notifications' },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={pages}
        renderItem={({ item }) =>
          item.key === 'welcome' ? (
            <WelcomePage onContinue={goToNextPage} />
          ) : (
            <NotificationPage onComplete={completeOnboarding} />
          )
        }
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        keyExtractor={(item) => item.key}
        onScroll={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentPage(page);
        }}
        scrollEventThrottle={16}
      />

      {/* Pagination Dots */}
      <View style={styles.dotsContainer}>
        {pages.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentPage ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_BG,
  },
  page: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[16],
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },

  // Logo
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  logo: {
    width: 180,
    height: 60,
  },

  // Typography
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: fonts.bold,
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: TEXT_SECONDARY,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * 1.6,
    marginBottom: spacing[8],
  },
  notifSubtitle: {
    maxWidth: 300,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.semibold,
    color: TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: spacing[5],
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Feature Cards
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: radius.lg,
    padding: spacing[4],
    marginBottom: spacing[3],
    gap: spacing[4],
  },
  featureRowRTL: {
    flexDirection: 'row-reverse',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(201, 169, 110, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.semibold,
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.regular,
    color: TEXT_SECONDARY,
    lineHeight: typography.fontSize.xs * 1.5,
  },

  // Bell Icon (Notification page)
  bellContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  bellCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(201, 169, 110, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom CTA
  bottomCTA: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[4],
  },
  primaryButton: {
    backgroundColor: TEXT_PRIMARY,
    width: '100%',
  },
  primaryButtonText: {
    color: DARK_BG,
    fontFamily: fonts.semibold,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing[4],
  },
  skipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.medium,
    color: TEXT_SECONDARY,
    textDecorationLine: 'underline',
  },

  // Pagination Dots
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing[3],
    gap: spacing[2],
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: DOT_ACTIVE,
    width: 24,
  },
  dotInactive: {
    backgroundColor: DOT_INACTIVE,
  },
});
