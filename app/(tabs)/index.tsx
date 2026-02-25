import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, typography, fonts, spacing } from '../../src/theme';
import { useProducts } from '../../src/hooks/useProducts';
import { ProductCard } from '../../src/components/product/ProductCard';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch, isRefetching } = useProducts();

  const products = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const renderHeader = () => (
    <View>
      {/* Hero Section - matches website style */}
      <View style={styles.hero}>
        <Image
          source={require('../../assets/images/logo/header-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.heroTitle}>Elite Style</Text>
        <Text style={styles.heroSubtitle}>إيليت ستايل</Text>
      </View>

      {/* Products Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('products.title')}</Text>
        <Text style={styles.sectionSubtitle}>{t('products.loading')}</Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary.DEFAULT} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
        </View>
      );
    }
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>{t('products.no_results')}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={renderHeader}
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary.DEFAULT} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  // Hero Section - minimal and elegant like website
  hero: {
    alignItems: 'center',
    paddingVertical: spacing[12],
    paddingHorizontal: spacing[6],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: {
    width: 120,
    height: 60,
    marginBottom: spacing[4],
  },
  heroTitle: {
    fontSize: 36, // Large, elegant
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 20,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginTop: spacing[1],
  },
  
  // Section Header
  sectionHeader: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 24, // text-2xl
    fontFamily: fonts.bold,
    color: colors.foreground,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginTop: spacing[1],
  },
  
  // Product Grid
  list: {
    paddingBottom: spacing[6],
  },
  row: {
    paddingHorizontal: spacing[2],
  },
  
  footer: {
    padding: spacing[4],
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing[12],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
});
