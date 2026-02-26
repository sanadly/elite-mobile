import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing, radius, commonStyles } from '../../theme';
import { useFilterStore, SortOption } from '../../store/filterStore';
import { useRTL } from '../../hooks/useRTL';
import { SORT_OPTIONS } from '../../constants/sort';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SortModal({ visible, onClose }: SortModalProps) {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { sortBy, setSortBy } = useFilterStore();

  const handleSelect = (option: SortOption) => {
    setSortBy(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={[styles.header, isRTL && styles.headerRTL]}>
            <Text style={[styles.headerTitle, isRTL && commonStyles.rtlText]}>
              {t('filters.sort_by')}
            </Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>

          {/* Options */}
          {SORT_OPTIONS.map((option) => {
            const isSelected = sortBy === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => handleSelect(option.key)}
                style={[styles.option, isRTL && styles.optionRTL]}
              >
                <Text
                  style={[
                    styles.optionText,
                    isSelected && styles.optionTextSelected,
                    isRTL && commonStyles.rtlText,
                  ]}
                >
                  {t(option.label)}
                </Text>
                {isSelected && (
                  <Ionicons name="checkmark" size={20} color={colors.primary.DEFAULT} />
                )}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: spacing[8],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
    paddingBottom: spacing[4],
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[4],
  },
  optionRTL: {
    flexDirection: 'row-reverse',
  },
  optionText: {
    fontSize: 15,
    fontFamily: fonts.regular,
    color: colors.foreground,
  },
  optionTextSelected: {
    fontFamily: fonts.semibold,
    color: colors.primary.DEFAULT,
  },
});
