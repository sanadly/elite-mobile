import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing, radius } from '../../theme';
import { useFilterStore } from '../../store/filterStore';
import { useRTL } from '../../hooks/useRTL';
import { CATEGORIES } from '../../constants/categories';
import { SORT_LABELS } from '../../constants/sort';

interface FilterChipsProps {
  onOpenFilters: () => void;
  onOpenSort: () => void;
}

export function FilterChips({ onOpenFilters, onOpenSort }: FilterChipsProps) {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const {
    category,
    sortBy,
    immediateDelivery,
    setCategory,
    toggleImmediateDelivery,
    activeFilterCount,
  } = useFilterStore();

  const filterCount = activeFilterCount();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      {/* Immediate Delivery chip — green */}
      <Pressable
        onPress={toggleImmediateDelivery}
        style={[
          styles.chip,
          immediateDelivery ? styles.chipDeliveryActive : styles.chipDelivery,
        ]}
      >
        <Ionicons
          name="flash"
          size={14}
          color={immediateDelivery ? colors.background : colors.availability.emerald}
        />
        <Text
          style={[
            styles.chipText,
            immediateDelivery ? styles.chipTextDeliveryActive : styles.chipTextDelivery,
          ]}
        >
          {t('filters.immediate_delivery')}
        </Text>
        {immediateDelivery && (
          <Ionicons name="checkmark" size={14} color="#ffffff" />
        )}
      </Pressable>

      {/* Filters button */}
      <Pressable
        onPress={onOpenFilters}
        style={[styles.chip, filterCount > 0 && styles.chipActive]}
      >
        <Ionicons
          name="options-outline"
          size={16}
          color={filterCount > 0 ? colors.primary.foreground : colors.foreground}
        />
        <Text style={[styles.chipText, filterCount > 0 && styles.chipTextActive]}>
          {t('filters.title')}
        </Text>
        {filterCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{filterCount}</Text>
          </View>
        )}
      </Pressable>

      {/* Sort chip */}
      <Pressable
        onPress={onOpenSort}
        style={[styles.chip, sortBy !== 'default' && styles.chipActive]}
      >
        <Ionicons
          name="swap-vertical-outline"
          size={16}
          color={sortBy !== 'default' ? colors.primary.foreground : colors.foreground}
        />
        <Text style={[styles.chipText, sortBy !== 'default' && styles.chipTextActive]}>
          {sortBy !== 'default' ? t(SORT_LABELS[sortBy]) : t('filters.sort_by')}
        </Text>
      </Pressable>

      {/* Category chips */}
      <Pressable
        onPress={() => setCategory('')}
        style={[styles.chip, !category && styles.chipActive]}
      >
        <Text style={[styles.chipText, !category && styles.chipTextActive]}>
          {t('filters.all_categories')}
        </Text>
      </Pressable>

      {CATEGORIES.map((cat) => (
        <Pressable
          key={cat}
          onPress={() => setCategory(category === cat ? '' : cat)}
          style={[styles.chip, category === cat && styles.chipActive]}
        >
          <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
            {t(`home.categories.${cat}`)}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing[4],
    gap: spacing[2],
    paddingVertical: spacing[2],
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing[3],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  chipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  chipDelivery: {
    borderColor: colors.availability.emerald,
    backgroundColor: colors.availability.emeraldLight,
  },
  chipDeliveryActive: {
    backgroundColor: colors.availability.emerald,
    borderColor: colors.availability.emerald,
  },
  chipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  chipTextActive: {
    color: colors.primary.foreground,
  },
  chipTextDelivery: {
    color: colors.availability.emerald,
  },
  chipTextDeliveryActive: {
    color: colors.background,
  },
  badge: {
    backgroundColor: colors.primary.foreground,
    borderRadius: radius.full,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
  },
});
