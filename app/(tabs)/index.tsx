import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { colors, typography, fonts, spacing, commonStyles } from '../../src/theme';
import { useProducts } from '../../src/hooks/useProducts';
import { ProductCard } from '../../src/components/product/ProductCard';
import { ErrorState } from '../../src/components/ui';
import { HeroSlider } from '../../src/components/home/HeroSlider';
import { CategorySlider } from '../../src/components/home/CategorySlider';
import { SearchBar } from '../../src/components/search/SearchBar';
import { useRTL } from '../../src/hooks/useRTL';

export default function HomeScreen() {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const router = useRouter();
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch, isRefetching } = useProducts();

  const products = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const renderHeader = () => (
    <View>
      <HeroSlider />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value=""
          onChangeText={() => {}}
          mode="button"
          onPress={() => router.push('/products')}
        />
      </View>

      <CategorySlider />

      {/* Products Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>
          {t('home.featured')}
        </Text>
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
    if (isError) {
      return <ErrorState onRetry={refetch} />;
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
  searchContainer: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[5],
  },
  sectionHeader: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.foreground,
    letterSpacing: -0.3,
  },
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
