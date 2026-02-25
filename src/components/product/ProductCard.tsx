import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, typography, fonts, spacing, radius, shadows } from '../../theme';
import { Product } from '../../hooks/useProducts';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [imageLoading, setImageLoading] = useState(true);

  const imageUrl = product.variants?.[0]?.images?.[0];
  const secondImageUrl = product.variants?.[0]?.images?.[1];

  // Calculate total stock and check immediate delivery
  const totalStock = product.variants?.reduce(
    (sum, variant) => sum + variant.sizes.reduce((s, size) => s + size.stock, 0),
    0
  ) || 0;

  const isOutOfStock = totalStock === 0;
  const isImmediateDelivery = totalStock > 0;

  // Get available colors (excluding 'default')
  const availableColors = product.variants
    ?.map(v => v.color)
    .filter(c => c.toLowerCase() !== 'default') || [];

  const accessibilityLabel = `${product.brand} ${product.model}, ${t('product_card.price')} ${product.price} euros${isOutOfStock ? `, ${t('product_card.out_of_stock')}` : isImmediateDelivery ? `, ${t('product_card.immediate_delivery')}` : ''}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(`/product/${product.id}` as any)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={t('accessibility.tap_to_view_product')}
    >
      {/* Image Container - Square aspect ratio like web */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <>
            <Image
              source={{ uri: imageUrl }}
              style={[styles.image, isOutOfStock && styles.imageOutOfStock]}
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

        {/* Gradient Overlay (like web hover effect) */}
        <View style={styles.gradientOverlay} />

        {/* Immediate Delivery Badge - matches web style */}
        {isImmediateDelivery && (
          <View style={styles.deliveryBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.deliveryText}>{t('product_card.immediate_delivery')}</Text>
          </View>
        )}

        {/* Out of Stock Badge - matches web style */}
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>{t('product_card.out_of_stock')}</Text>
          </View>
        )}

        {/* Low Stock Indicator */}
        {totalStock > 0 && totalStock < 10 && (
          <View style={styles.stockIndicator}>
            <Text style={styles.stockText}>
              {t('product_card.only_x_left', { count: totalStock })}
            </Text>
          </View>
        )}
      </View>

      {/* Product Info - matches web typography */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.brand} {product.model}
        </Text>

        {/* Color info - matches web */}
        {availableColors.length > 0 && (
          <Text style={styles.colors}>
            {availableColors.length === 1
              ? availableColors[0]
              : t('product_card.colors_available', { count: availableColors.length })}
          </Text>
        )}

        <Text style={styles.price}>{'\u20AC'}{product.price.toFixed(2)}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: spacing[2],
  },
  pressed: {
    opacity: 0.8,
  },

  // Image Container - Square like web with rounded-xl
  imageContainer: {
    width: '100%',
    aspectRatio: 1, // Square aspect ratio
    backgroundColor: colors.secondary.DEFAULT + '80', // secondary/50
    borderRadius: radius.lg, // rounded-xl
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOutOfStock: {
    opacity: 0.5,
  },
  imageLoader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.muted.DEFAULT,
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary.DEFAULT + '80',
  },
  placeholderText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
  },

  // Gradient overlay like web
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '30%',
    backgroundColor: 'transparent',
  },

  // Immediate Delivery Badge - matches web styling
  deliveryBadge: {
    position: 'absolute',
    top: spacing[3],
    left: spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing[2] + 2,
    paddingVertical: spacing[1],
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(134, 239, 172, 0.5)',
    gap: 4,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981', // emerald-500
  },
  deliveryText: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: '#15803d', // emerald-700
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Out of Stock Badge - matches web styling
  outOfStockBadge: {
    position: 'absolute',
    top: spacing[3],
    right: spacing[3],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1] + 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  outOfStockText: {
    fontSize: 10,
    fontFamily: fonts.semibold,
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Low Stock Indicator
  stockIndicator: {
    position: 'absolute',
    bottom: spacing[3],
    left: spacing[3],
    right: spacing[3],
    backgroundColor: 'rgba(245, 158, 11, 0.95)', // Gold/Amber
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: 4,
  },
  stockText: {
    fontSize: 10,
    fontFamily: fonts.bold,
    color: '#fff',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Product Info - matches web typography
  info: {
    paddingTop: spacing[4],
    gap: spacing[1],
  },
  name: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.bold,
    color: colors.foreground,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    lineHeight: typography.lineHeight.tight * typography.fontSize.base,
  },
  colors: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
  price: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginTop: spacing[1],
  },
});
