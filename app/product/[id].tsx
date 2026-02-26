import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Pressable,
  FlatList,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProduct } from '../../src/hooks/useProducts';
import { useBrand } from '../../src/hooks/useBrand';
import { useCartStore } from '../../src/store/cartStore';
import { colors, typography, fonts, spacing, radius, shadows } from '../../src/theme';
import { Button } from '../../src/components/ui';
import { useRTL } from '../../src/hooks/useRTL';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isRTL = useRTL();
  const lang = i18n.language as 'en' | 'ar';
  const { data: product, isLoading } = useProduct(id);
  const { data: brand } = useBrand(product?.brand);
  const { addItem } = useCartStore();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveImageIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.errorText}>{t('errors.not_found')}</Text>
      </View>
    );
  }

  const variant = product.variants?.[selectedVariant];
  const allSizes = variant?.sizes || [];
  const selectedSizeData = variant?.sizes?.find(s => s.size === selectedSize);
  const images = product.images || [];
  const hasMultipleVariants = (product.variants?.length || 0) > 1;

  const totalStock = product.variants?.reduce(
    (sum, v) => sum + v.sizes.reduce((s, size) => s + size.stock, 0),
    0
  ) || 0;
  const isOutOfStock = totalStock === 0;

  const handleAddToCart = () => {
    if (!selectedSize || !variant || !selectedSizeData) return;
    const result = addItem({
      variantId: `${product.id}-${variant.color}-${selectedSize}`,
      productId: product.id,
      name: product.name?.[lang] || product.name?.en || product.model,
      price: product.price,
      image: images[0],
      size: selectedSize,
      color: variant.color,
      maxStock: selectedSizeData.stock,
    });
    if (result.success) router.push('/(tabs)/cart');
  };

  const productName = product.name?.[lang] || product.name?.en || product.model;
  const productDescription = product.description?.[lang] || product.description?.en;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
      >
        {/* Image Gallery */}
        <View style={styles.imageGalleryContainer}>
          {images.length > 0 ? (
            <>
              <FlatList
                data={images}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                keyExtractor={(_, i) => i.toString()}
                renderItem={({ item }) => (
                  <View style={styles.imageSlide}>
                    <Image
                      source={{ uri: item }}
                      style={styles.productImage}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  </View>
                )}
                getItemLayout={(_, index) => ({
                  length: width,
                  offset: width * index,
                  index,
                })}
              />
              {images.length > 1 && (
                <View style={styles.dotsContainer}>
                  {images.map((_, i) => (
                    <View
                      key={i}
                      style={[
                        styles.dot,
                        activeImageIndex === i ? styles.dotActive : styles.dotInactive,
                      ]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={[styles.imageSlide, styles.placeholderImage]}>
              <Text style={styles.placeholderText}>{t('product_card.no_image')}</Text>
            </View>
          )}

          {/* Back Button */}
          <Pressable
            onPress={() => router.back()}
            style={[styles.backButton, isRTL ? styles.backButtonRTL : null]}
            hitSlop={12}
          >
            <Text style={styles.backButtonText}>{isRTL ? '\u203A' : '\u2039'}</Text>
          </Pressable>
        </View>

        {/* Product Info */}
        <View style={styles.infoContainer}>
          <Text style={[styles.brand, isRTL && styles.rtlText]}>{product.brand}</Text>
          <Text style={[styles.productName, isRTL && styles.rtlText]}>{productName}</Text>

          {/* Price */}
          <View style={[styles.priceRow, isRTL && styles.rowReverse]}>
            <Text style={styles.price}>{'\u20AC'}{product.price.toFixed(2)}</Text>
            {isOutOfStock && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockBadgeText}>{t('products.out_of_stock')}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {productDescription && (
            <Text style={[styles.description, isRTL && styles.rtlText]}>
              {productDescription}
            </Text>
          )}

          <View style={styles.divider} />

          {/* Color Selection */}
          {hasMultipleVariants && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
                {t('products.select_color')}
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.optionsRow}
              >
                {product.variants?.map((v, i) => {
                  const isSelected = selectedVariant === i;
                  return (
                    <Pressable
                      key={i}
                      onPress={() => {
                        setSelectedVariant(i);
                        setSelectedSize(null);
                      }}
                      style={[
                        styles.colorOption,
                        isSelected && styles.colorOptionSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.colorOptionText,
                          isSelected && styles.colorOptionTextSelected,
                        ]}
                      >
                        {v.color}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Size Selection */}
          {allSizes.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
                {t('products.select_size')}
                {variant?.sizeSystem && (
                  <Text style={styles.sizeSystemLabel}> ({variant.sizeSystem})</Text>
                )}
              </Text>
              <View style={[styles.sizeGrid, isRTL && styles.sizeGridRTL]}>
                {allSizes.map(s => {
                  const isSelected = selectedSize === s.size;
                  const isAvailable = s.stock > 0;
                  return (
                    <Pressable
                      key={s.size}
                      onPress={() => isAvailable && setSelectedSize(s.size)}
                      disabled={!isAvailable}
                      style={[
                        styles.sizeOption,
                        isSelected && styles.sizeOptionSelected,
                        !isAvailable && styles.sizeOptionDisabled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeOptionText,
                          isSelected && styles.sizeOptionTextSelected,
                          !isAvailable && styles.sizeOptionTextDisabled,
                        ]}
                      >
                        {s.size}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Brand Profile */}
          {brand && (brand.description_en || brand.description_ar || brand.description) && (
            <>
              <View style={styles.divider} />
              <View style={styles.brandCard}>
                <View style={[styles.brandHeader, isRTL && styles.rowReverse]}>
                  {brand.logo_url && (
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
                    <Text style={[styles.brandName, isRTL && styles.rtlText]}>{brand.name}</Text>
                    {brand.website && (
                      <Text style={[styles.brandWebsite, isRTL && styles.rtlText]}>
                        {brand.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                      </Text>
                    )}
                  </View>
                </View>
                <Text style={[styles.brandDescription, isRTL && styles.rtlText]}>
                  {lang === 'ar'
                    ? (brand.description_ar || brand.description_en || brand.description)
                    : (brand.description_en || brand.description || brand.description_ar)}
                </Text>
                <Pressable
                  style={[styles.brandLinkRow, isRTL && styles.rowReverse]}
                  onPress={() => {
                    // TODO: Navigate to brand filter when catalog screen is available
                  }}
                >
                  <Text style={styles.brandLinkText}>
                    {t('products.view_all_from_brand', { brand: brand.name })}
                  </Text>
                  <Ionicons
                    name={isRTL ? 'chevron-back' : 'chevron-forward'}
                    size={14}
                    color={colors.primary.DEFAULT}
                  />
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Bottom CTA Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing[3] }]}>
        <View style={styles.bottomBarInner}>
          <View style={styles.bottomPriceContainer}>
            <Text style={styles.bottomPriceLabel}>{t('products.title')}</Text>
            <Text style={styles.bottomPrice}>{'\u20AC'}{product.price.toFixed(2)}</Text>
          </View>
          <Button
            title={t('products.add_to_cart')}
            onPress={handleAddToCart}
            disabled={!selectedSize || isOutOfStock}
            size="lg"
            style={styles.addToCartButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
  },

  // Image Gallery
  imageGalleryContainer: {
    position: 'relative',
    backgroundColor: colors.muted.DEFAULT,
  },
  imageSlide: {
    width,
    aspectRatio: 0.85,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary.DEFAULT + '80',
  },
  placeholderText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: spacing[4],
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.DEFAULT,
  },
  dotInactive: {
    width: 6,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  backButton: {
    position: 'absolute',
    top: spacing[12] + spacing[2],
    left: spacing[4],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.subtle,
  },
  backButtonRTL: {
    left: undefined,
    right: spacing[4],
  },
  backButtonText: {
    fontSize: 28,
    lineHeight: 34,
    color: colors.primary.DEFAULT,
    fontFamily: fonts.bold,
  },

  // Product Info
  infoContainer: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
  brand: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.semibold,
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  productName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginTop: spacing[1],
    lineHeight: typography.fontSize['2xl'] * 1.2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[3],
  },
  rowReverse: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
  },
  price: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  outOfStockBadge: {
    backgroundColor: colors.destructive.DEFAULT + '15',
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  },
  outOfStockBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.semibold,
    color: colors.destructive.DEFAULT,
  },
  description: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginTop: spacing[4],
    lineHeight: typography.fontSize.sm * 1.6,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[5],
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },

  // Sections
  section: {
    marginBottom: spacing[5],
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    marginBottom: spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sizeSystemLabel: {
    textTransform: 'none',
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    letterSpacing: 0,
  },

  // Color Options
  optionsRow: {
    gap: spacing[2],
  },
  colorOption: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2] + 2,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  colorOptionSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.DEFAULT,
  },
  colorOptionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  colorOptionTextSelected: {
    color: colors.primary.foreground,
  },

  // Size Options
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  sizeGridRTL: {
    flexDirection: 'row-reverse',
  },
  sizeOption: {
    minWidth: 52,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeOptionSelected: {
    borderColor: colors.primary.DEFAULT,
    backgroundColor: colors.primary.DEFAULT,
  },
  sizeOptionDisabled: {
    opacity: 0.35,
    backgroundColor: colors.muted.DEFAULT,
  },
  sizeOptionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.semibold,
    color: colors.foreground,
  },
  sizeOptionTextSelected: {
    color: colors.primary.foreground,
  },
  sizeOptionTextDisabled: {
    color: colors.muted.foreground,
  },

  // Brand Profile
  brandCard: {
    backgroundColor: colors.secondary.DEFAULT + '40',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
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
  brandWebsite: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginTop: 2,
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

  // Bottom CTA
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing[3],
    paddingHorizontal: spacing[5],
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  bottomPriceContainer: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
  bottomPrice: {
    fontSize: typography.fontSize.xl,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  addToCartButton: {
    flex: 1,
  },
});
