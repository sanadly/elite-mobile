import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../theme';
import { useRTL } from '../../hooks/useRTL';
import type { AppNotification } from '../../types/notification';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  order_update: 'receipt-outline',
  promotion: 'megaphone-outline',
  system: 'information-circle-outline',
};

const TYPE_COLORS: Record<string, string> = {
  order_update: colors.primary.DEFAULT,
  promotion: colors.availability.reservation,
  system: colors.muted.foreground,
};

interface NotificationItemProps {
  notification: AppNotification;
  onPress?: () => void;
  onDelete?: () => void;
}

export function NotificationItem({ notification, onPress, onDelete }: NotificationItemProps) {
  const { i18n } = useTranslation();
  const isRTL = useRTL();
  const isArabic = i18n.language === 'ar';

  const title = isArabic ? notification.title_ar : notification.title_en;
  const body = isArabic ? notification.body_ar : notification.body_en;
  const iconName = TYPE_ICONS[notification.type] || 'notifications-outline';
  const iconColor = TYPE_COLORS[notification.type] || colors.primary.DEFAULT;

  const timeAgo = formatDistanceToNow(new Date(notification.created_at), {
    addSuffix: true,
    locale: isArabic ? ar : enUS,
  });

  return (
    <Pressable
      style={[styles.container, !notification.is_read && styles.unread]}
      onPress={onPress}
    >
      <View style={[styles.row, isRTL && styles.rowRTL]}>
        <View style={[styles.iconContainer, { backgroundColor: `${iconColor}15` }]}>
          <Ionicons name={iconName} size={22} color={iconColor} />
        </View>
        <View style={styles.contentContainer}>
          <View style={[styles.titleRow, isRTL && styles.titleRowRTL]}>
            <Text
              style={[
                styles.title,
                !notification.is_read && styles.titleUnread,
                isRTL && commonStyles.rtlText,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </View>
          <Text style={[styles.body, isRTL && commonStyles.rtlText]} numberOfLines={2}>
            {body}
          </Text>
          <Text style={[styles.time, isRTL && commonStyles.rtlText]}>{timeAgo}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unread: {
    backgroundColor: `${colors.primary.DEFAULT}08`,
  },
  row: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: 2,
  },
  titleRowRTL: {
    flexDirection: 'row-reverse',
  },
  title: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.regular,
    color: colors.foreground,
    flex: 1,
  },
  titleUnread: {
    fontFamily: fonts.semibold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary.DEFAULT,
  },
  body: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginBottom: spacing[1],
    lineHeight: 18,
  },
  time: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
  },
});
