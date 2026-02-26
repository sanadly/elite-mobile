import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors, typography, fonts, spacing } from '../../theme';
import { calculateLoyaltyTier, getLoyaltyProgress, LOYALTY_TIERS } from '../../lib/loyalty';
import type { LoyaltyTier } from '../../types/firestore';
import { useRTL } from '../../hooks/useRTL';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface LoyaltyCardProps {
  totalSpend: number;
}

const TIER_COLORS = {
  classic: colors.tier.classic,
  prestige: colors.tier.prestige,
  black: colors.tier.black,
};

const TIER_ICONS = {
  classic: 'star-outline',
  prestige: 'star',
  black: 'diamond',
};

export function LoyaltyCard({ totalSpend }: LoyaltyCardProps) {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const currentTier = calculateLoyaltyTier(totalSpend);
  const progress = getLoyaltyProgress(totalSpend, currentTier);

  const getTierName = (tier: string) => {
    const names: { [key: string]: string } = {
      classic: t('loyalty.tier.classic'),
      prestige: t('loyalty.tier.prestige'),
      black: t('loyalty.tier.black'),
    };
    return names[tier] || tier;
  };

  const strokeDashoffset = useSharedValue(1);

  const size = 120;
  const strokeWidth = 8;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    strokeDashoffset.value = withTiming(1 - progress.percentage / 100, {
      duration: 1000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [progress.percentage]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: strokeDashoffset.value * circumference,
  }));

  const tierColor = TIER_COLORS[currentTier];
  const tierIcon = TIER_ICONS[currentTier];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.tierBadge, isRTL && styles.tierBadgeRTL]}>
          <Ionicons name={tierIcon} size={20} color={tierColor} />
          <Text style={[styles.tierName, { color: tierColor }]}>{getTierName(currentTier)}</Text>
        </View>
      </View>

      <View style={[styles.progressContainer, isRTL && styles.progressContainerRTL]}>
        <View style={styles.circleContainer}>
          <Svg width={size} height={size}>
            <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.muted.DEFAULT} strokeWidth={strokeWidth} fill="none" />
            <AnimatedCircle cx={size / 2} cy={size / 2} r={r} stroke={tierColor} strokeWidth={strokeWidth} strokeDasharray={circumference} animatedProps={animatedProps} strokeLinecap="round" fill="none" rotation="-90" origin={`${size / 2}, ${size / 2}`} />
          </Svg>
          <View style={styles.percentageContainer}>
            <Text style={styles.percentageText}>{Math.round(progress.percentage)}%</Text>
          </View>
        </View>

        <View style={styles.progressInfo}>
          <Text style={[styles.spendLabel, isRTL && styles.rtlText]}>{t('loyalty.total_spend')}</Text>
          <Text style={[styles.spendAmount, isRTL && styles.rtlText]}>{'\u20AC'}{totalSpend.toFixed(0)}</Text>

          {progress.nextTier && (
            <>
              <View style={styles.divider} />
              <Text style={[styles.nextTierLabel, isRTL && styles.rtlText]}>{t('loyalty.next_tier')}</Text>
              <View style={[styles.nextTierRow, isRTL && styles.nextTierRowRTL]}>
                <Ionicons name={TIER_ICONS[progress.nextTier]} size={18} color={TIER_COLORS[progress.nextTier]} />
                <Text style={[styles.nextTierName, { color: TIER_COLORS[progress.nextTier] }]}>{getTierName(progress.nextTier)}</Text>
              </View>
              <Text style={[styles.remainingAmount, isRTL && styles.rtlText]}>{t('loyalty.unlock', { amount: progress.spendNeeded.toFixed(0) })}</Text>
            </>
          )}

          {currentTier === 'black' && (
            <>
              <View style={styles.divider} />
              <View style={styles.maxTierContainer}>
                <Ionicons name="trophy" size={24} color={colors.tier.black} />
                <Text style={styles.maxTierText}>{t('loyalty.max_tier')}</Text>
              </View>
            </>
          )}
        </View>
      </View>

      <View style={styles.benefitsContainer}>
        <Text style={[styles.benefitsTitle, isRTL && styles.rtlText]}>{t('loyalty.benefits.title')}</Text>

        <View style={[styles.benefitRow, isRTL && styles.benefitRowRTL]}>
          <Ionicons name={currentTier === 'classic' ? 'close-circle' : 'checkmark-circle'} size={20} color={currentTier === 'classic' ? colors.muted.foreground : colors.status.success.text} />
          <Text style={[styles.benefitText, currentTier === 'classic' && styles.benefitDisabled, isRTL && styles.rtlText]}>{t('loyalty.benefits.free_shipping')}</Text>
        </View>

        <View style={[styles.benefitRow, isRTL && styles.benefitRowRTL]}>
          <Ionicons name={currentTier === 'classic' ? 'close-circle' : 'checkmark-circle'} size={20} color={currentTier === 'classic' ? colors.muted.foreground : colors.status.success.text} />
          <Text style={[styles.benefitText, currentTier === 'classic' && styles.benefitDisabled, isRTL && styles.rtlText]}>{t('loyalty.benefits.concierge')}</Text>
        </View>

        <View style={[styles.benefitRow, isRTL && styles.benefitRowRTL]}>
          <Ionicons name="checkmark-circle" size={20} color={colors.status.success.text} />
          <Text style={[styles.benefitText, isRTL && styles.rtlText]}>
            {currentTier === 'classic' && t('loyalty.benefits.deposit_classic')}
            {currentTier === 'prestige' && t('loyalty.benefits.deposit_prestige')}
            {currentTier === 'black' && t('loyalty.benefits.deposit_black')}
          </Text>
        </View>

        {currentTier === 'black' && (
          <View style={[styles.benefitRow, isRTL && styles.benefitRowRTL]}>
            <Ionicons name="checkmark-circle" size={20} color={colors.status.success.text} />
            <Text style={[styles.benefitText, isRTL && styles.rtlText]}>{t('loyalty.benefits.priority_support')}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: colors.card, borderRadius: 12, padding: spacing[4], borderWidth: 1, borderColor: colors.border },
  header: { marginBottom: spacing[4] },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], alignSelf: 'flex-start', paddingHorizontal: spacing[3], paddingVertical: spacing[2], backgroundColor: colors.muted.DEFAULT, borderRadius: 20 },
  tierBadgeRTL: { flexDirection: 'row-reverse', alignSelf: 'flex-end' },
  tierName: { fontSize: typography.fontSize.base, fontFamily: fonts.bold, textTransform: 'uppercase', letterSpacing: 1 },
  progressContainer: { flexDirection: 'row', alignItems: 'center', gap: spacing[6], marginBottom: spacing[6] },
  progressContainerRTL: { flexDirection: 'row-reverse' },
  circleContainer: { position: 'relative' },
  percentageContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' },
  percentageText: { fontSize: typography.fontSize['2xl'], fontFamily: fonts.bold, color: colors.foreground },
  progressInfo: { flex: 1 },
  spendLabel: { fontSize: typography.fontSize.sm, fontFamily: fonts.regular, color: colors.muted.foreground, marginBottom: spacing[1] },
  spendAmount: { fontSize: typography.fontSize['2xl'], fontFamily: fonts.bold, color: colors.foreground },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing[3] },
  nextTierLabel: { fontSize: typography.fontSize.sm, fontFamily: fonts.regular, color: colors.muted.foreground, marginBottom: spacing[1] },
  nextTierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1], marginBottom: spacing[1] },
  nextTierRowRTL: { flexDirection: 'row-reverse' },
  nextTierName: { fontSize: typography.fontSize.lg, fontFamily: fonts.bold, textTransform: 'uppercase', letterSpacing: 1 },
  remainingAmount: { fontSize: typography.fontSize.sm, fontFamily: fonts.regular, color: colors.muted.foreground },
  maxTierContainer: { alignItems: 'center', gap: spacing[2] },
  maxTierText: { fontSize: typography.fontSize.base, fontFamily: fonts.semibold, color: colors.tier.black, textAlign: 'center' },
  benefitsContainer: { paddingTop: spacing[4], borderTopWidth: 1, borderTopColor: colors.border },
  benefitsTitle: { fontSize: typography.fontSize.base, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[3] },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[2] },
  benefitRowRTL: { flexDirection: 'row-reverse' },
  benefitText: { fontSize: typography.fontSize.base, fontFamily: fonts.regular, color: colors.foreground },
  benefitDisabled: { color: colors.muted.foreground, textDecorationLine: 'line-through' },
});
