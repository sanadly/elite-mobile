import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, spacing, radius } from '../../theme';

interface FilterChipGroupProps {
  items: Array<{ key: string; label: string }>;
  selectedKey: string;
  onSelect: (key: string) => void;
  allLabel: string;
}

export function FilterChipGroup({ items, selectedKey, onSelect, allLabel }: FilterChipGroupProps) {
  return (
    <View style={styles.chipGrid}>
      <Pressable
        onPress={() => onSelect('')}
        style={[styles.chip, !selectedKey && styles.chipActive]}
      >
        <Text style={[styles.chipText, !selectedKey && styles.chipTextActive]}>
          {allLabel}
        </Text>
      </Pressable>

      {items.map((item) => (
        <Pressable
          key={item.key}
          onPress={() => onSelect(selectedKey === item.key ? '' : item.key)}
          style={[styles.chip, selectedKey === item.key && styles.chipActive]}
        >
          <Text style={[styles.chipText, selectedKey === item.key && styles.chipTextActive]}>
            {item.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing[2],
  },
  chip: {
    paddingHorizontal: spacing[4],
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
  chipText: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  chipTextActive: {
    color: colors.primary.foreground,
  },
});
