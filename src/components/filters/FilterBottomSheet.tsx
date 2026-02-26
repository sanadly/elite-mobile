import React, { useCallback, useMemo, forwardRef, ComponentProps } from 'react';
import { View, Text, Pressable, StyleSheet, Switch } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing, radius, commonStyles } from '../../theme';
import { useFilterStore } from '../../store/filterStore';
import { useBrands } from '../../hooks/useBrand';
import { useRTL } from '../../hooks/useRTL';
import { CATEGORIES } from '../../constants/categories';

const GENDERS = [
  { key: 'men', label: 'filters.gender_men' },
  { key: 'women', label: 'filters.gender_women' },
  { key: 'unisex', label: 'filters.gender_unisex' },
] as const;

// Common sizes grouped by type — matches the website's smart size system
const SIZE_GROUPS = {
  clothing: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
  numeric: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  volume: ['30ML', '50ML', '75ML', '100ML', '150ML', '200ML'],
  watch: ['36mm', '38mm', '40mm', '41mm', '42mm', '44mm', '45mm'],
} as const;

interface FilterBottomSheetProps {
  onClose: () => void;
}

export const FilterBottomSheet = forwardRef<BottomSheet, FilterBottomSheetProps>(
  ({ onClose }, ref) => {
    const { t } = useTranslation();
    const isRTL = useRTL();
    const {
      category,
      immediateDelivery,
      brand,
      gender,
      size,
      setCategory,
      toggleImmediateDelivery,
      setBrand,
      setGender,
      setSize,
      clearAll,
    } = useFilterStore();
    const { data: availableBrands = [] } = useBrands();

    const snapPoints = useMemo(() => ['60%', '90%'], []);

    const renderBackdrop = useCallback(
      (props: ComponentProps<typeof BottomSheetBackdrop>) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
        />
      ),
      []
    );

    const handleReset = () => {
      clearAll();
    };

    // Determine which size group to show based on selected category
    const activeSizeGroup = useMemo(() => {
      switch (category) {
        case 'shoes':
          return { key: 'numeric' as const, sizes: SIZE_GROUPS.numeric };
        case 'clothes':
          return { key: 'clothing' as const, sizes: SIZE_GROUPS.clothing };
        case 'parfums':
        case 'cosmetics':
          return { key: 'volume' as const, sizes: SIZE_GROUPS.volume };
        case 'watches':
          return { key: 'watch' as const, sizes: SIZE_GROUPS.watch };
        default:
          return null; // Show all size types
      }
    }, [category]);

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        onClose={onClose}
        handleIndicatorStyle={styles.indicator}
        backgroundStyle={styles.sheetBackground}
      >
        {/* Header */}
        <View style={[styles.header, isRTL && styles.headerRTL]}>
          <Text style={[styles.headerTitle, isRTL && commonStyles.rtlText]}>
            {t('filters.title')}
          </Text>
          <Pressable onPress={handleReset} hitSlop={8}>
            <Text style={styles.resetText}>{t('filters.reset_all')}</Text>
          </Pressable>
        </View>

        <BottomSheetScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Immediate Delivery Section */}
          <View style={styles.section}>
            <View style={[styles.switchRow, isRTL && styles.switchRowRTL]}>
              <View style={[styles.deliveryLabel, isRTL && styles.deliveryLabelRTL]}>
                <Ionicons name="flash" size={16} color={colors.availability.emerald} />
                <Text style={[styles.deliveryText, isRTL && commonStyles.rtlText]}>
                  {t('filters.immediate_delivery')}
                </Text>
              </View>
              <Switch
                value={immediateDelivery}
                onValueChange={toggleImmediateDelivery}
                trackColor={{ false: colors.border, true: colors.availability.emerald }}
                thumbColor={colors.background}
              />
            </View>
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>
              {t('filters.category')}
            </Text>
            <View style={styles.chipGrid}>
              <Pressable
                onPress={() => setCategory('')}
                style={[styles.filterChip, !category && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !category && styles.filterChipTextActive,
                  ]}
                >
                  {t('filters.all_categories')}
                </Text>
              </Pressable>

              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(category === cat ? '' : cat)}
                  style={[
                    styles.filterChip,
                    category === cat && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      category === cat && styles.filterChipTextActive,
                    ]}
                  >
                    {t(`home.categories.${cat}`)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Gender Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>
              {t('filters.gender')}
            </Text>
            <View style={styles.chipGrid}>
              <Pressable
                onPress={() => setGender('')}
                style={[styles.filterChip, !gender && styles.filterChipActive]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !gender && styles.filterChipTextActive,
                  ]}
                >
                  {t('filters.all_categories')}
                </Text>
              </Pressable>

              {GENDERS.map((g) => (
                <Pressable
                  key={g.key}
                  onPress={() => setGender(gender === g.key ? '' : g.key)}
                  style={[
                    styles.filterChip,
                    gender === g.key && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      gender === g.key && styles.filterChipTextActive,
                    ]}
                  >
                    {t(g.label)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Brand Section */}
          {availableBrands.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>
                {t('filters.brand')}
              </Text>
              <View style={styles.chipGrid}>
                <Pressable
                  onPress={() => setBrand('')}
                  style={[styles.filterChip, !brand && styles.filterChipActive]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      !brand && styles.filterChipTextActive,
                    ]}
                  >
                    {t('filters.all_categories')}
                  </Text>
                </Pressable>

                {availableBrands.map((b) => (
                  <Pressable
                    key={b}
                    onPress={() => setBrand(brand === b ? '' : b)}
                    style={[
                      styles.filterChip,
                      brand === b && styles.filterChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        brand === b && styles.filterChipTextActive,
                      ]}
                    >
                      {b}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* Size Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>
              {t('filters.size')}
            </Text>

            {activeSizeGroup ? (
              // Show sizes for the specific category
              <View style={styles.sizeGrid}>
                {activeSizeGroup.sizes.map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setSize(size === s ? '' : s)}
                    style={[
                      styles.sizeChip,
                      size === s && styles.sizeChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sizeChipText,
                        size === s && styles.sizeChipTextActive,
                      ]}
                    >
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              // Show all size groups when no category selected
              <>
                {(Object.keys(SIZE_GROUPS) as Array<keyof typeof SIZE_GROUPS>).map(
                  (groupKey) => (
                    <View key={groupKey} style={styles.sizeGroupSection}>
                      <Text style={[styles.sizeGroupTitle, isRTL && commonStyles.rtlText]}>
                        {t(`filters.size_types.${groupKey}`)}
                      </Text>
                      <View style={styles.sizeGrid}>
                        {SIZE_GROUPS[groupKey].map((s) => (
                          <Pressable
                            key={s}
                            onPress={() => setSize(size === s ? '' : s)}
                            style={[
                              styles.sizeChip,
                              size === s && styles.sizeChipActive,
                            ]}
                          >
                            <Text
                              style={[
                                styles.sizeChipText,
                                size === s && styles.sizeChipTextActive,
                              ]}
                            >
                              {s}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )
                )}
              </>
            )}
          </View>
        </BottomSheetScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable onPress={onClose} style={styles.showResultsButton}>
            <Text style={styles.showResultsText}>{t('filters.show_results')}</Text>
          </Pressable>
        </View>
      </BottomSheet>
    );
  }
);

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  indicator: {
    backgroundColor: colors.border,
    width: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  resetText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.primary.DEFAULT,
  },
  content: {
    paddingHorizontal: spacing[5],
    paddingBottom: spacing[8],
  },
  section: {
    paddingTop: spacing[5],
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    marginBottom: spacing[3],
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  filterChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  filterChipTextActive: {
    color: colors.primary.foreground,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing[2],
  },
  switchRowRTL: {
    flexDirection: 'row-reverse',
  },
  deliveryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  deliveryLabelRTL: {
    flexDirection: 'row-reverse',
  },
  deliveryText: {
    fontSize: 15,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  // Size styles — pill buttons matching website
  sizeGroupSection: {
    marginBottom: spacing[4],
  },
  sizeGroupTitle: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
    marginBottom: spacing[2],
  },
  sizeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  sizeChip: {
    minWidth: 48,
    height: 36,
    paddingHorizontal: spacing[3],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeChipActive: {
    backgroundColor: colors.primary.DEFAULT,
    borderColor: colors.primary.DEFAULT,
  },
  sizeChipText: {
    fontSize: 13,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  sizeChipTextActive: {
    color: colors.primary.foreground,
  },
  footer: {
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  showResultsButton: {
    backgroundColor: colors.primary.DEFAULT,
    paddingVertical: spacing[3],
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  showResultsText: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.primary.foreground,
  },
});
