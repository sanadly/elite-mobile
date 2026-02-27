import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../theme';
import type { Brand } from '../../types/brand';

interface BrandProfileCardProps {
  brandName: string;
  brand: Brand | null | undefined;
  lang: 'en' | 'ar';
  isRTL: boolean;
  viewAllLabel: string;
}

export function BrandProfileCard({ brandName, brand, lang, isRTL, viewAllLabel }: BrandProfileCardProps) {
  const router = useRouter();

  const description = brand && (brand.description_en || brand.description_ar || brand.description)
    ? lang === 'ar'
      ? (brand.description_ar || brand.description_en || brand.description)
      : (brand.description_en || brand.description || brand.description_ar)
    : null;

  return (
    <View style={styles.brandCard}>
      <View style={[styles.brandHeader, isRTL && commonStyles.rowReverse]}>
        {brand?.logo_url && (
          <View style={styles.brandLogoContainer}>
            <Image
              source={{ uri: brand.logo_url }}
              style={styles.brandLogo}
              contentFit="contain"
              cachePolicy="memory-disk"
            />
          </View>
        )}
        <View style={styles.brandHeaderText}>
          <Text style={[styles.brandName, isRTL && commonStyles.rtlText]}>
            {brand?.name || brandName}
          </Text>
        </View>
      </View>
      {description && (
        <Text style={[styles.brandDescription, isRTL && commonStyles.rtlText]}>
          {description}
        </Text>
      )}
      <Pressable
        style={[styles.brandLinkRow, isRTL && commonStyles.rowReverse]}
        onPress={() => router.push(`/products?brand=${encodeURIComponent(brandName)}` as any)}
      >
        <Text style={styles.brandLinkText}>{viewAllLabel}</Text>
        <Ionicons
          name={isRTL ? 'chevron-back' : 'chevron-forward'}
          size={14}
          color={colors.primary.DEFAULT}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  brandCard: {
    backgroundColor: colors.card?.DEFAULT ? colors.card.DEFAULT + '80' : colors.background + '80',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border + '66',
    padding: spacing[6],
    gap: spacing[4],
    marginBottom: spacing[5],
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  brandLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  brandLogo: {
    width: '100%',
    height: '100%',
  },
  brandHeaderText: {
    flex: 1,
  },
  brandName: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  brandDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    lineHeight: typography.fontSize.sm * 1.6,
  },
  brandLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  },
  brandLinkText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.semibold,
    color: colors.primary.DEFAULT,
  },
});
