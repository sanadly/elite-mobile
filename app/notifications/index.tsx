import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Pressable, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState } from '../../src/components/ui';
import { colors, typography, fonts, spacing, commonStyles } from '../../src/theme';
import { NotificationItem } from '../../src/components/notifications/NotificationItem';
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
} from '../../src/hooks/useNotifications';
import { useRTL } from '../../src/hooks/useRTL';
import { useRequireAuth } from '../../src/hooks/useRequireAuth';
import type { AppNotification } from '../../src/types/notification';
import { isToday, isYesterday, isThisWeek } from 'date-fns';

type SectionData = {
  title: string;
  data: AppNotification[];
};

function groupByDate(notifications: AppNotification[], t: (key: string) => string): SectionData[] {
  const today: AppNotification[] = [];
  const yesterday: AppNotification[] = [];
  const thisWeek: AppNotification[] = [];
  const earlier: AppNotification[] = [];

  for (const n of notifications) {
    const date = new Date(n.created_at);
    if (isToday(date)) today.push(n);
    else if (isYesterday(date)) yesterday.push(n);
    else if (isThisWeek(date)) thisWeek.push(n);
    else earlier.push(n);
  }

  const sections: SectionData[] = [];
  if (today.length) sections.push({ title: t('notifications.today'), data: today });
  if (yesterday.length) sections.push({ title: t('notifications.yesterday'), data: yesterday });
  if (thisWeek.length) sections.push({ title: t('notifications.this_week'), data: thisWeek });
  if (earlier.length) sections.push({ title: t('notifications.earlier'), data: earlier });

  return sections;
}

export default function NotificationsScreen() {
  const isAuthenticated = useRequireAuth();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const router = useRouter();

  if (!isAuthenticated) return null;
  const { data: notifications, isLoading, refetch } = useNotifications();
  const markRead = useMarkAsRead();
  const markAllRead = useMarkAllAsRead();
  const deleteNotif = useDeleteNotification();

  const hasUnread = notifications?.some((n) => !n.is_read);

  const handlePress = (notification: AppNotification) => {
    if (!notification.is_read) {
      markRead.mutate(notification.id);
    }

    if (notification.data?.orderId) {
      router.push(`/orders/${notification.data.orderId}`);
    } else if (notification.data?.productId) {
      router.push(`/product/${notification.data.productId}`);
    }
  };

  const handleDelete = (notification: AppNotification) => {
    Alert.alert(
      t('notifications.delete'),
      t('notifications.delete_confirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteNotif.mutate(notification.id),
        },
      ]
    );
  };

  const sections = groupByDate(notifications || [], t);

  type ListItem = { kind: 'header'; title: string; id: string } | { kind: 'notification'; notification: AppNotification; id: string };

  const flatData: ListItem[] = [];
  for (const section of sections) {
    flatData.push({ kind: 'header', title: section.title, id: `header-${section.title}` });
    for (const n of section.data) {
      flatData.push({ kind: 'notification', notification: n, id: n.id });
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen
          options={{
            title: t('notifications.title'),
          }}
        />
        <ActivityIndicator size="large" color={colors.primary.DEFAULT} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: t('notifications.title'),
          headerRight: hasUnread
            ? () => (
                <Pressable onPress={() => markAllRead.mutate()} style={styles.headerAction}>
                  <Text style={styles.headerActionText}>{t('notifications.mark_all_read')}</Text>
                </Pressable>
              )
            : undefined,
        }}
      />
      <FlatList
        data={flatData}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => {
          if (item.kind === 'header') {
            return (
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>
                  {item.title}
                </Text>
              </View>
            );
          }

          return (
            <NotificationItem
              notification={item.notification}
              onPress={() => handlePress(item.notification)}
              onDelete={() => handleDelete(item.notification)}
            />
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="notifications-off-outline"
            title={t('notifications.empty')}
            subtitle={t('notifications.empty_subtitle')}
          />
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerAction: {
    paddingHorizontal: spacing[2],
  },
  headerActionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.medium,
    color: colors.primary.foreground,
  },
  sectionHeader: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    backgroundColor: colors.muted.DEFAULT,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: fonts.semibold,
    color: colors.muted.foreground,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
