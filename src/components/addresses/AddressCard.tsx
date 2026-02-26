import React from 'react';
import { View, Text, StyleSheet, Pressable, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, fonts, spacing, radius } from '../../theme';
import { useRTL } from '../../hooks/useRTL';
import type { Address } from '../../types/address';

const LABEL_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  work: 'briefcase-outline',
  other: 'location-outline',
};

interface AddressCardProps {
  address: Address;
  onPress?: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}

export function AddressCard({ address, onPress, onDelete, onSetDefault }: AddressCardProps) {
  const { t } = useTranslation();
  const isRTL = useRTL();

  const rtlText: TextStyle = isRTL ? { textAlign: 'right', writingDirection: 'rtl' } : {};
  const rtlRow: ViewStyle = isRTL ? { flexDirection: 'row-reverse' } : {};

  return (
    <Pressable style={viewStyles.container} onPress={onPress}>
      <View style={[viewStyles.header, rtlRow]}>
        <View style={[viewStyles.labelBadge, rtlRow]}>
          <Ionicons
            name={LABEL_ICONS[address.label] || 'location-outline'}
            size={16}
            color={colors.primary.DEFAULT}
          />
          <Text style={textStyles.labelText}>
            {t(`addresses.label.${address.label}`)}
          </Text>
        </View>
        {address.is_default && (
          <View style={viewStyles.defaultBadge}>
            <Text style={textStyles.defaultText}>{t('addresses.default_badge')}</Text>
          </View>
        )}
      </View>

      <Text style={[textStyles.name, rtlText]}>{address.full_name}</Text>
      <Text style={[textStyles.detail, rtlText]}>{address.phone}</Text>
      <Text style={[textStyles.detail, rtlText]}>{address.city}</Text>
      {address.address_line ? (
        <Text style={[textStyles.detail, rtlText]}>{address.address_line}</Text>
      ) : null}

      <View style={[viewStyles.actions, rtlRow]}>
        {!address.is_default && onSetDefault && (
          <Pressable style={viewStyles.actionButton} onPress={onSetDefault}>
            <Ionicons name="star-outline" size={16} color={colors.primary.DEFAULT} />
            <Text style={textStyles.actionText}>{t('addresses.set_default')}</Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable style={viewStyles.actionButton} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color={colors.destructive.DEFAULT} />
            <Text style={[textStyles.actionText, textStyles.deleteText]}>{t('common.delete')}</Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );
}

const viewStyles = StyleSheet.create({
  container: {
    backgroundColor: colors.card.DEFAULT,
    borderRadius: radius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing[3],
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing[2],
  } as ViewStyle,
  labelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: colors.muted.DEFAULT,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  } as ViewStyle,
  defaultBadge: {
    backgroundColor: colors.primary.DEFAULT,
    paddingHorizontal: spacing[2],
    paddingVertical: spacing[1],
    borderRadius: radius.full,
  } as ViewStyle,
  actions: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[3],
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  } as ViewStyle,
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
  } as ViewStyle,
});

const textStyles = StyleSheet.create({
  labelText: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.semibold,
    color: colors.primary.DEFAULT,
    textTransform: 'uppercase',
  },
  defaultText: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.semibold,
    color: colors.primary.foreground,
  },
  name: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    marginBottom: spacing[1],
  },
  detail: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginBottom: 2,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.primary.DEFAULT,
  },
  deleteText: {
    color: colors.destructive.DEFAULT,
  },
});
