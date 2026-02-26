import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Pressable,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProductsByBrand } from '../../src/hooks/useProducts';
import { useBrand } from '../../src/hooks/useBrand';
import { ProductCard } from '../../src/components/product/ProductCard';
import { colors, typography, fonts, spacing, radius, shadows, commonStyles } from '../../src/theme';
import { useRTL } from '../../src/hooks/useRTL';

const { width } = Dimensions.get('window');

export default function BrandScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const brandName = decodeURIComponent(name || '');
  const { t, i18n } = useTranslation();
  const isRTL = useRTL();
  const lang = i18n.language as 'en' | 'ar';
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { data: brand, isLoading: brandLoading } = useBrand(brandName);
  const { data: products, isLoading: productsLoading } = useProductsByBrand(brandName);

  const isLoading = brandLoading || productsLoading;

  const brandDescription = brand
    ? lang === 'ar'
      ? brand.description_ar || brand.description_en || brand.description
      : brand.description_en || brand.description || brand.description_ar
    : null;

  const renderHeader = () => (
    <View style={styles.headerContent}>
      {/* Brand Info Card */}
      {brand && (
        <View style={styles.brandCard}>
          <View style={[styles.brandRow, isRTL && commonStyles.rowReverse]}>
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
            <View style={styles.brandInfo}>
              <Text style={[styles.brandName, isRTL && commonStyles.rtlText]}>
                {brand.name}
              </Text>
            </View>
          </View>
          {brandDescription && (
            <Text style={[styles.brandDescription, isRTL && commonStyles.rtlText]}>
              {brandDescription}
            </Text>
          )}
        </View>
      )}

      {/* Products count */}
      {products && products.length > 0 && (
        <Text style={[styles.productsCount, isRTL && commonStyles.rtlText]}>
          {t('brand.products_count', { count: products.length })}
        </Text>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + spacing[2] }]}>
        <Pressable
          onPress={() => router.back()}
          style={[styles.backButton, isRTL && styles.backButtonRTL]}
          hitSlop={12}
        >
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={24}
            color={colors.foreground}
          />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {brandName}
        </Text>
        <View style={styles.backButton} />
      </View>

      {/* Products Grid */}
      <FlatList
        data={products || []}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productCardWrapper}>
            <ProductCard product={item} />
          </View>
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, isRTL && commonStyles.rtlText]}>
              {t('products.no_results')}
            </Text>
            <Text style={[styles.emptySubtext, isRTL && commonStyles.rtlText]}>
              {t('products.no_results_subtitle')}
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing[5] },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingBottom: spacing[3],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonRTL: {
    transform: [{ scaleX: 1 }],
  },
  topBarTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.foreground,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Header
  headerContent: {
    paddingHorizontal: spacing[3],
    paddingTop: spacing[5],
    paddingBottom: spacing[2],
  },

  // Brand Card
  brandCard: {
    backgroundColor: colors.secondary.DEFAULT + '40',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[5],
    gap: spacing[4],
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  brandLogoContainer: {
    width: 56,
    height: 56,
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
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: typography.fontSize.xl,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  brandDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    lineHeight: typography.fontSize.sm * 1.6,
  },

  // Products Count
  productsCount: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
    marginTop: spacing[5],
    marginBottom: spacing[1],
  },

  // List
  listContent: {
    paddingHorizontal: spacing[1],
  },
  productCardWrapper: {
    width: '50%',
  },

  // Empty State
  emptyContainer: {
    paddingVertical: spacing[16],
    alignItems: 'center',
    gap: spacing[2],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.semibold,
    color: colors.foreground,
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
});
