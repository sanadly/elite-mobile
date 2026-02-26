import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, fonts, spacing, radius, shadows, commonStyles } from '../../theme';
import { Product } from '../../types/product';
import { useRTL } from '../../hooks/useRTL';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const [imageLoading, setImageLoading] = useState(true);

  const imageUrl = product.images?.[0] || product.variants?.[0]?.images?.[0];

  const isImmediateDelivery = product.hasStock === true;
  const isReservable = product.show_out_of_stock === true;
  const stockRemaining = product.stockRemaining || 0;

  const availableColors = product.availableColors || product.variants?.map(v => v.color) || [];

  const accessibilityLabel = `${product.brand} ${product.model}, ${t('product_card.price')} ${product.price} euros${isImmediateDelivery ? `, ${t('product_card.immediate_delivery')}` : ''}${isReservable ? `, ${t('product_card.available_by_reservation')}` : ''}`;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
      onPress={() => router.push(`/product/${product.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={t('accessibility.tap_to_view_product')}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <>
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
            />
            {imageLoading && (
              <View style={styles.imageLoader}>
                <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
              </View>
            )}
          </>
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>{t('product_card.no_image')}</Text>
          </View>
        )}

        <View style={styles.gradientOverlay} />

        {(isImmediateDelivery || isReservable) && (
          <View style={[styles.badgeContainer, isRTL && styles.badgeContainerRTL]}>
            {isImmediateDelivery && (
              <View style={styles.deliveryBadge}>
                <View style={styles.pulseDot} />
                <Text style={styles.deliveryText}>{t('product_card.immediate_delivery')}</Text>
              </View>
            )}
            {isReservable && (
              <View style={styles.reservableBadge}>
                <Text style={styles.reservableText}>{t('product_card.available_by_reservation')}</Text>
              </View>
            )}
          </View>
        )}

        {stockRemaining === 1 && (
          <View style={styles.stockIndicator}>
            <Text style={styles.stockText}>
              {t('product_card.only_1_left')}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={[styles.name, isRTL && commonStyles.rtlText]} numberOfLines={2}>
          {product.brand} {product.model}
        </Text>

        {availableColors.length > 0 && (
          <Text style={[styles.colors, isRTL && commonStyles.rtlText]}>
            {availableColors.length === 1
              ? availableColors[0]
              : t('product_card.colors_available', { count: availableColors.length })}
          </Text>
        )}

        <Text style={[styles.price, isRTL && commonStyles.rtlText]}>{'\u20AC'}{product.price.toFixed(2)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, margin: spacing[2] },
  pressed: { opacity: 0.8 },
  imageContainer: { width: '100%', aspectRatio: 1, backgroundColor: colors.secondary.DEFAULT + '80', borderRadius: radius.lg, overflow: 'hidden', position: 'relative' },
  image: { width: '100%', height: '100%' },
  imageLoader: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.muted.DEFAULT },
  placeholder: { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.secondary.DEFAULT + '80' },
  placeholderText: { fontSize: typography.fontSize.sm, fontFamily: fonts.medium, color: colors.muted.foreground },
  gradientOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: 'transparent' },
  badgeContainer: { position: 'absolute', top: spacing[3], left: spacing[3], gap: 4 },
  badgeContainerRTL: { left: undefined, right: spacing[3], alignItems: 'flex-end' },
  deliveryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.overlay.light90, paddingHorizontal: spacing[2] + 2, paddingVertical: spacing[1], borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(134, 239, 172, 0.5)', gap: 4 },
  reservableBadge: { backgroundColor: colors.overlay.light90, paddingHorizontal: spacing[2] + 2, paddingVertical: spacing[1], borderRadius: radius.full, borderWidth: 1, borderColor: colors.availability.reservableBorder },
  reservableText: { fontSize: 10, fontFamily: fonts.semibold, color: colors.availability.reservableText, letterSpacing: 0.5 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.availability.immediate },
  deliveryText: { fontSize: 10, fontFamily: fonts.semibold, color: colors.status.success.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  stockIndicator: { position: 'absolute', bottom: spacing[3], left: spacing[3], right: spacing[3], backgroundColor: 'rgba(245, 158, 11, 0.95)', paddingHorizontal: spacing[2], paddingVertical: spacing[1], borderRadius: radius.sm },
  stockText: { fontSize: 10, fontFamily: fonts.bold, color: colors.background, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },
  info: { paddingTop: spacing[4], gap: spacing[1] },
  name: { fontSize: typography.fontSize.base, fontFamily: fonts.bold, color: colors.foreground, textTransform: 'uppercase', letterSpacing: -0.5, lineHeight: typography.lineHeight.tight * typography.fontSize.base },
  colors: { fontSize: typography.fontSize.xs, fontFamily: fonts.regular, color: colors.muted.foreground },
  price: { fontSize: typography.fontSize.sm, fontFamily: fonts.bold, color: colors.foreground, marginTop: spacing[1] },
});
