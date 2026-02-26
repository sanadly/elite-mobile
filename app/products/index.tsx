import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../src/theme';
import { useFilteredProducts } from '../../src/hooks/useFilteredProducts';
import { useFilterStore } from '../../src/store/filterStore';
import { ProductCard } from '../../src/components/product/ProductCard';
import { SearchBar } from '../../src/components/search/SearchBar';
import { FilterChips } from '../../src/components/filters/FilterChips';
import { FilterBottomSheet } from '../../src/components/filters/FilterBottomSheet';
import { SortModal } from '../../src/components/filters/SortModal';
import { useRTL } from '../../src/hooks/useRTL';

export default function ProductsScreen() {
  const { category: initialCategory, brand: initialBrand, search: initialSearch } =
    useLocalSearchParams<{ category?: string; brand?: string; search?: string }>();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [sortVisible, setSortVisible] = useState(false);
  const {
    search,
    setSearch,
    setCategory,
    setBrand,
    clearAll,
    activeFilterCount,
  } = useFilterStore();

  // Initialize filters from navigation params
  useEffect(() => {
    if (initialCategory) setCategory(initialCategory);
    if (initialBrand) setBrand(initialBrand);
    if (initialSearch) setSearch(initialSearch);

    return () => {
      // Reset filters when leaving the screen
      clearAll();
    };
  }, []);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useFilteredProducts();

  const products = useMemo(() => data?.pages.flatMap((page) => page) ?? [], [data]);

  const handleOpenFilters = useCallback(() => {
    bottomSheetRef.current?.snapToIndex(0);
  }, []);

  const handleCloseFilters = useCallback(() => {
    bottomSheetRef.current?.close();
  }, []);

  const renderHeader = () => (
    <View style={styles.headerSpacer} />
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
        <Ionicons name="search-outline" size={48} color={colors.muted.foreground} />
        <Text style={[styles.emptyText, isRTL && commonStyles.rtlText]}>
          {search ? t('products.no_results') : t('filters.no_results')}
        </Text>
        <Text style={[styles.emptySubtext, isRTL && commonStyles.rtlText]}>
          {t('products.no_results_subtitle')}
        </Text>
        {activeFilterCount() > 0 && (
          <Pressable onPress={clearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>{t('filters.clear_filters')}</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Sticky header with search + filters */}
      <View style={styles.stickyHeader}>
        {/* Back button + Search bar */}
        <View style={[styles.searchRow, isRTL && styles.searchRowRTL]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
            hitSlop={8}
          >
            <Ionicons
              name={isRTL ? 'arrow-forward' : 'arrow-back'}
              size={22}
              color={colors.foreground}
            />
          </Pressable>
          <View style={styles.searchBarContainer}>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              onClear={() => setSearch('')}
              autoFocus={!!initialSearch || (!initialCategory && !initialBrand)}
            />
          </View>
        </View>

        {/* Filter chips */}
        <FilterChips
          onOpenFilters={handleOpenFilters}
          onOpenSort={() => setSortVisible(true)}
        />
      </View>

      {/* Product grid */}
      <FlatList
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
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary.DEFAULT}
          />
        }
      />

      {/* Filter bottom sheet */}
      <FilterBottomSheet ref={bottomSheetRef} onClose={handleCloseFilters} />

      {/* Sort modal */}
      <SortModal visible={sortVisible} onClose={() => setSortVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  stickyHeader: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    gap: spacing[3],
  },
  searchRowRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBarContainer: {
    flex: 1,
  },
  headerSpacer: {
    height: spacing[2],
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
    gap: spacing[3],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.medium,
    color: colors.foreground,
    marginTop: spacing[3],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
  clearButton: {
    marginTop: spacing[3],
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.primary.DEFAULT,
  },
  clearButtonText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.primary.DEFAULT,
  },
});
