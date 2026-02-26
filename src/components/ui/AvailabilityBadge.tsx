import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing, radius } from '../../theme';

export type AvailabilityType = 'immediate' | 'reservation' | 'out_of_stock';

interface AvailabilityBadgeProps {
  type: AvailabilityType;
  size?: 'sm' | 'md';
}

export function AvailabilityBadge({ type, size = 'md' }: AvailabilityBadgeProps) {
  const { t } = useTranslation();

  const label =
    type === 'immediate'
      ? t('product_card.immediate_delivery')
      : type === 'reservation'
        ? t('product_card.available_by_reservation')
        : t('product_card.out_of_stock');

  const isSmall = size === 'sm';

  return (
    <View style={[
      styles.badge,
      isSmall && styles.badgeSm,
      type === 'immediate' && styles.immediate,
      type === 'reservation' && styles.reservation,
      type === 'out_of_stock' && styles.outOfStock,
    ]}>
      {type !== 'out_of_stock' && (
        <View style={[
          styles.dot,
          isSmall && styles.dotSm,
          type === 'immediate' && styles.dotImmediate,
          type === 'reservation' && styles.dotReservation,
        ]} />
      )}
      <Text style={[
        styles.text,
        isSmall && styles.textSm,
        type === 'immediate' && styles.textImmediate,
        type === 'reservation' && styles.textReservation,
        type === 'out_of_stock' && styles.textOutOfStock,
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  badgeSm: {
    gap: 4,
    paddingHorizontal: spacing[2],
    paddingVertical: 3,
  },
  immediate: {
    backgroundColor: colors.availability.immediateBg,
    borderColor: colors.availability.immediateBorder,
  },
  reservation: {
    backgroundColor: colors.availability.reservationBg,
    borderColor: colors.availability.reservationBorder,
  },
  outOfStock: {
    backgroundColor: colors.availability.outOfStockBg,
    borderColor: colors.availability.outOfStockBorder,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotSm: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotImmediate: {
    backgroundColor: colors.availability.immediate,
  },
  dotReservation: {
    backgroundColor: colors.availability.reservation,
  },
  text: {
    fontSize: 11,
    fontFamily: fonts.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  textSm: {
    fontSize: 10,
    letterSpacing: 0.3,
  },
  textImmediate: {
    color: colors.availability.emerald,
  },
  textReservation: {
    color: colors.availability.reservationDark,
  },
  textOutOfStock: {
    color: colors.availability.outOfStock,
  },
});
