import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import Animated, { FadeInRight } from 'react-native-reanimated';
import { useSimilarProducts } from '../../hooks/useProducts';
import { useRTL } from '../../hooks/useRTL';
import { Skeleton } from '../feedback/Skeleton';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../theme';

interface SimilarProductsProps {
  productId: string;
}

export function SimilarProducts({ productId }: SimilarProductsProps) {
  const { data: products, isLoading } = useSimilarProducts(productId);
  const { t } = useTranslation();
  const isRTL = useRTL();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, isRTL && commonStyles.rtlText]}>
          {t('products.you_may_also_like')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonCard}>
              <Skeleton width={CARD_WIDTH} height={CARD_WIDTH} borderRadius={radius.lg} />
              <View style={styles.skeletonInfo}>
                <Skeleton width="70%" height={14} style={styles.skeletonSpacing} />
                <Skeleton width="40%" height={14} />
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && commonStyles.rtlText]}>
        {t('products.you_may_also_like')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          isRTL && styles.scrollContentRTL,
        ]}
      >
        {products.map((product, index) => {
          const imageUrl = product.images?.[0];
          return (
            <Animated.View
              key={product.id}
              entering={FadeInRight.delay(index * 80).duration(400).springify()}
            >
              <Pressable
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push(`/product/${product.id}` as any)}
              >
                <View style={styles.imageContainer}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={styles.image}
                      contentFit="cover"
                      transition={200}
                      cachePolicy="memory-disk"
                    />
                  ) : (
                    <View style={[styles.image, styles.placeholder]}>
                      <Text style={styles.placeholderText}>
                        {t('product_card.no_image')}
                      </Text>
                    </View>
                  )}
                  {product.hasStock && (
                    <View style={[styles.badge, isRTL && styles.badgeRTL]}>
                      <View style={styles.pulseDot} />
                    </View>
                  )}
                </View>
                <View style={styles.info}>
                  <Text
                    style={[styles.name, isRTL && commonStyles.rtlText]}
                    numberOfLines={1}
                  >
                    {product.brand}
                  </Text>
                  <Text
                    style={[styles.model, isRTL && commonStyles.rtlText]}
                    numberOfLines={1}
                  >
                    {product.model}
                  </Text>
                  <Text style={[styles.price, isRTL && commonStyles.rtlText]}>
                    {'\u20AC'}{product.price.toFixed(2)}
                  </Text>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = 150;

const styles = StyleSheet.create({
  container: {
    marginTop: spacing[2],
  },
  title: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing[3],
  },
  scrollContent: {
    paddingRight: spacing[5],
    gap: spacing[3],
  },
  scrollContentRTL: {
    flexDirection: 'row-reverse',
  },
  card: {
    width: CARD_WIDTH,
  },
  cardPressed: {
    opacity: 0.8,
  },
  imageContainer: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.secondary.DEFAULT + '80',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary.DEFAULT + '80',
  },
  placeholderText: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
  },
  badge: {
    position: 'absolute',
    top: spacing[2],
    left: spacing[2],
    backgroundColor: colors.overlay.light90,
    borderRadius: radius.full,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRTL: {
    left: undefined,
    right: spacing[2],
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.availability.immediate,
  },
  info: {
    paddingTop: spacing[2],
    gap: 2,
  },
  name: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.semibold,
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  model: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.foreground,
    textTransform: 'uppercase',
    letterSpacing: -0.3,
  },
  price: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginTop: 2,
  },
  // Skeleton
  skeletonCard: {
    width: CARD_WIDTH,
  },
  skeletonInfo: {
    marginTop: spacing[2],
  },
  skeletonSpacing: {
    marginBottom: spacing[1],
  },
});
