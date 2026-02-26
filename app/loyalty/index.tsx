import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import {
  calculateLoyaltyTier,
  getLoyaltyProgress,
  LOYALTY_TIERS,
} from '../../src/lib/loyalty';
import type { LoyaltyTier } from '../../src/types/user';
import { useRTL } from '../../src/hooks/useRTL';
import { Card } from '../../src/components/ui';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const TIER_COLORS: Record<LoyaltyTier, string> = {
  classic: colors.tier.classic,
  prestige: colors.tier.prestige,
  black: colors.tier.black,
};

const TIER_ICONS: Record<LoyaltyTier, keyof typeof Ionicons.glyphMap> = {
  classic: 'star-outline',
  prestige: 'star',
  black: 'diamond',
};

const TIER_ORDER: LoyaltyTier[] = ['classic', 'prestige', 'black'];

export default function LoyaltyDetailScreen() {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { userData } = useAuthStore();
  const totalSpend = userData?.totalSpend || 0;
  const currentTier = calculateLoyaltyTier(totalSpend);
  const progress = getLoyaltyProgress(totalSpend, currentTier);

  const getTierName = (tier: LoyaltyTier) => t(`loyalty.tier.${tier}`);

  // Progress ring animation
  const strokeDashoffset = useSharedValue(1);
  const size = 160;
  const strokeWidth = 10;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    strokeDashoffset.value = withTiming(1 - progress.percentage / 100, {
      duration: 1200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress.percentage]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value * circumference,
  }));

  const tierColor = TIER_COLORS[currentTier];

  const getTierStatus = (tier: LoyaltyTier): string => {
    if (tier === currentTier) return t('loyalty.detail.current');
    const tierIndex = TIER_ORDER.indexOf(tier);
    const currentIndex = TIER_ORDER.indexOf(currentTier);
    return tierIndex < currentIndex
      ? t('loyalty.detail.unlocked')
      : t('loyalty.detail.locked');
  };

  const getTierBenefits = (tier: LoyaltyTier): string[] => {
    const benefits: string[] = [];
    const config = LOYALTY_TIERS[tier];
    if (config.benefits.freeShipping) benefits.push(t('loyalty.benefits.free_shipping'));
    if (config.benefits.conciergeAccess) benefits.push(t('loyalty.benefits.concierge'));
    if (tier === 'classic') benefits.push(t('loyalty.benefits.deposit_classic'));
    if (tier === 'prestige') benefits.push(t('loyalty.benefits.deposit_prestige'));
    if (tier === 'black') {
      benefits.push(t('loyalty.benefits.deposit_black'));
      benefits.push(t('loyalty.benefits.priority_support'));
    }
    return benefits;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: t('loyalty.detail.title') }} />

      {/* Current Tier Hero */}
      <Card variant="elevated" style={styles.heroCard}>
        <Text style={[styles.sectionLabel, isRTL && commonStyles.rtlText]}>
          {t('loyalty.detail.current_tier')}
        </Text>

        <View style={styles.heroContent}>
          <View style={styles.circleContainer}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={colors.muted.DEFAULT}
                strokeWidth={strokeWidth}
                fill="none"
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={tierColor}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                animatedProps={animatedProps}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>
            <View style={styles.circleInner}>
              <Ionicons name={TIER_ICONS[currentTier]} size={32} color={tierColor} />
              <Text style={[styles.tierNameLarge, { color: tierColor }]}>
                {getTierName(currentTier)}
              </Text>
            </View>
          </View>
        </View>

        {/* Progress Info */}
        <View style={styles.progressSection}>
          <View style={[styles.progressRow, isRTL && styles.progressRowRTL]}>
            <Text style={[styles.progressLabel, isRTL && commonStyles.rtlText]}>
              {t('loyalty.detail.spent_so_far')}
            </Text>
            <Text style={[styles.progressValue, isRTL && commonStyles.rtlText]}>
              {'\u20AC'}{totalSpend.toFixed(0)}
            </Text>
          </View>

          {/* Progress Bar */}
          {progress.nextTier && (
            <>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress.percentage}%`, backgroundColor: tierColor }]} />
              </View>
              <Text style={[styles.progressHint, isRTL && commonStyles.rtlText]}>
                {t('loyalty.detail.spend_more', { amount: `\u20AC${progress.spendNeeded.toFixed(0)}` })}{' '}
                <Text style={{ color: TIER_COLORS[progress.nextTier], fontFamily: fonts.bold }}>
                  {getTierName(progress.nextTier)}
                </Text>
              </Text>
            </>
          )}

          {currentTier === 'black' && (
            <View style={styles.maxTierBanner}>
              <Ionicons name="trophy" size={24} color={colors.tier.black} />
              <Text style={[styles.maxTierText, isRTL && commonStyles.rtlText]}>
                {t('loyalty.max_tier')}
              </Text>
            </View>
          )}
        </View>
      </Card>

      {/* All Tiers */}
      <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>
        {t('loyalty.detail.all_tiers')}
      </Text>

      {TIER_ORDER.map((tier) => {
        const isCurrent = tier === currentTier;
        const tierConf = LOYALTY_TIERS[tier];
        const benefits = getTierBenefits(tier);

        return (
          <Card
            key={tier}
            style={{
              ...styles.tierCard,
              ...(isCurrent ? { borderColor: TIER_COLORS[tier], borderWidth: 2 } : {}),
            }}
          >
            <View style={[styles.tierHeader, isRTL && styles.tierHeaderRTL]}>
              <View style={[styles.tierBadge, isRTL && styles.tierBadgeRTL]}>
                <Ionicons name={TIER_ICONS[tier]} size={20} color={TIER_COLORS[tier]} />
                <Text style={[styles.tierCardName, { color: TIER_COLORS[tier] }]}>
                  {getTierName(tier)}
                </Text>
              </View>
              <View style={[styles.statusBadge, isCurrent && styles.statusBadgeCurrent]}>
                <Text style={[styles.statusText, isCurrent && styles.statusTextCurrent]}>
                  {getTierStatus(tier)}
                </Text>
              </View>
            </View>

            <Text style={[styles.threshold, isRTL && commonStyles.rtlText]}>
              {tierConf.minSpend === 0
                ? t('loyalty.detail.tier_threshold_start')
                : t('loyalty.detail.tier_threshold', { amount: tierConf.minSpend.toLocaleString() })}
            </Text>

            <View style={styles.benefitsList}>
              {benefits.map((benefit, i) => (
                <View key={i} style={[styles.benefitItem, isRTL && styles.benefitItemRTL]}>
                  <Ionicons name="checkmark-circle" size={16} color={TIER_COLORS[tier]} />
                  <Text style={[styles.benefitText, isRTL && commonStyles.rtlText]}>{benefit}</Text>
                </View>
              ))}
            </View>
          </Card>
        );
      })}

      {/* How It Works */}
      <Card style={styles.howItWorksCard}>
        <View style={[styles.howItWorksHeader, isRTL && styles.howItWorksHeaderRTL]}>
          <Ionicons name="information-circle-outline" size={24} color={colors.primary.DEFAULT} />
          <Text style={[styles.howItWorksTitle, isRTL && commonStyles.rtlText]}>
            {t('loyalty.detail.how_it_works')}
          </Text>
        </View>
        <Text style={[styles.howItWorksText, isRTL && commonStyles.rtlText]}>
          {t('loyalty.detail.how_it_works_text')}
        </Text>
      </Card>

      <View style={styles.bottomSpacing} />
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
  heroCard: {
    marginBottom: spacing[6],
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.semibold,
    color: colors.muted.foreground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing[4],
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  circleContainer: {
    position: 'relative',
  },
  circleInner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierNameLarge: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing[1],
  },
  progressSection: {
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  progressRowRTL: {
    flexDirection: 'row-reverse',
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
  progressValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.muted.DEFAULT,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginBottom: spacing[2],
  },
  progressBar: {
    height: '100%',
    borderRadius: radius.full,
  },
  progressHint: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
  maxTierBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
  },
  maxTierText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.bold,
    color: colors.tier.black,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginBottom: spacing[3],
  },
  tierCard: {
    marginBottom: spacing[3],
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  },
  tierHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  tierBadgeRTL: {
    flexDirection: 'row-reverse',
  },
  tierCardName: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
    backgroundColor: colors.muted.DEFAULT,
  },
  statusBadgeCurrent: {
    backgroundColor: colors.primary.DEFAULT,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.semibold,
    color: colors.muted.foreground,
  },
  statusTextCurrent: {
    color: colors.primary.foreground,
  },
  threshold: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginBottom: spacing[3],
  },
  benefitsList: {
    gap: spacing[2],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  benefitItemRTL: {
    flexDirection: 'row-reverse',
  },
  benefitText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.foreground,
  },
  howItWorksCard: {
    marginTop: spacing[3],
  },
  howItWorksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[2],
  },
  howItWorksHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  howItWorksTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  howItWorksText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: spacing[8],
  },
});
