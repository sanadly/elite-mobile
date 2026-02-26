import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../src/hooks/useOrders';
import { colors, typography, fonts, spacing, commonStyles } from '../../src/theme';
import { Card, EmptyState, ErrorState } from '../../src/components/ui';
import { SkeletonList } from '../../src/components/feedback';
import { format } from 'date-fns';
import { useRTL } from '../../src/hooks/useRTL';

const STATUS_COLORS = {
  pending: { bg: colors.status.pending.bg, text: colors.status.pending.text },
  confirmed: { bg: colors.orderStatus.confirmed.bg, text: colors.orderStatus.confirmed.text },
  processing: { bg: colors.orderStatus.processing.bg, text: colors.orderStatus.processing.text },
  shipped: { bg: colors.orderStatus.shipped.bg, text: colors.orderStatus.shipped.text },
  delivered: { bg: colors.status.success.bg, text: colors.status.success.text },
  cancelled: { bg: colors.status.error.bg, text: colors.status.error.text },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { data: orders, isLoading, isError, refetch, isRefetching } = useOrders();

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: t('orders.status.pending'),
      confirmed: t('orders.status.confirmed'),
      processing: t('orders.status.processing'),
      shipped: t('orders.status.shipped'),
      delivered: t('orders.status.delivered'),
      cancelled: t('orders.status.cancelled'),
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: t('orders.title') }} />
        <SkeletonList count={5} type="order" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: t('orders.title') }} />
        <ErrorState onRetry={refetch} />
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: t('orders.title') }} />
        <EmptyState
          icon="receipt-outline"
          title={t('orders.empty')}
          subtitle={t('orders.empty_subtitle')}
          actionLabel={t('cart.continue_shopping')}
          onAction={() => router.push('/(tabs)')}
        />
      </>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('orders.title') }} />
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status as keyof typeof STATUS_COLORS];
          return (
            <Pressable onPress={() => router.push(`/orders/${item.id}`)}>
              <Card style={styles.orderCard}>
                <View style={[styles.orderHeader, isRTL && commonStyles.rowReverse]}>
                  <View>
                    <Text style={[styles.orderNumber, isRTL && commonStyles.rtlText]}>#{item.order_number}</Text>
                    <Text style={[styles.orderDate, isRTL && commonStyles.rtlText]}>{format(new Date(item.created_at), 'MMM dd, yyyy • HH:mm')}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>{getStatusLabel(item.status)}</Text>
                  </View>
                </View>

                <View style={[styles.orderDetails, isRTL && commonStyles.rowReverse]}>
                  <View style={[styles.detailRow, isRTL && commonStyles.rowReverse]}>
                    <Ionicons name="location-outline" size={16} color={colors.muted.foreground} />
                    <Text style={[styles.detailText, isRTL && commonStyles.rtlText]}>{item.shipping_address.city}</Text>
                  </View>
                  <View style={[styles.detailRow, isRTL && commonStyles.rowReverse]}>
                    <Ionicons name="cash-outline" size={16} color={colors.muted.foreground} />
                    <Text style={[styles.detailText, isRTL && commonStyles.rtlText]}>COD</Text>
                  </View>
                </View>

                <View style={[styles.orderFooter, isRTL && commonStyles.rowReverse]}>
                  <Text style={[styles.totalLabel, isRTL && commonStyles.rtlText]}>{t('orders.total')}</Text>
                  <Text style={styles.totalAmount}>€{item.total_eur.toFixed(2)}</Text>
                </View>

                <View style={[styles.viewDetailsRow, isRTL && styles.viewDetailsRowRTL]}>
                  <Text style={styles.viewDetailsText}>{t('orders.view_details')}</Text>
                  <Ionicons name={isRTL ? 'chevron-back' : 'chevron-forward'} size={20} color={colors.primary.DEFAULT} />
                </View>
              </Card>
            </Pressable>
          );
        }}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary.DEFAULT} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing[4] },
  orderCard: { marginBottom: spacing[3] },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing[3] },
  orderNumber: { fontSize: typography.fontSize.lg, fontFamily: fonts.bold, color: colors.foreground, marginBottom: spacing[1] },
  orderDate: { fontSize: typography.fontSize.sm, color: colors.muted.foreground, fontFamily: fonts.regular },
  statusBadge: { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: 12 },
  statusText: { fontSize: typography.fontSize.xs, fontFamily: fonts.semibold, textTransform: 'uppercase', letterSpacing: 0.5 },
  orderDetails: { flexDirection: 'row', gap: spacing[4], marginBottom: spacing[3], paddingBottom: spacing[3], borderBottomWidth: 1, borderBottomColor: colors.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[1] },
  detailText: { fontSize: typography.fontSize.sm, color: colors.muted.foreground, fontFamily: fonts.regular },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] },
  totalLabel: { fontSize: typography.fontSize.base, fontFamily: fonts.medium, color: colors.foreground },
  totalAmount: { fontSize: typography.fontSize.xl, fontFamily: fonts.bold, color: colors.primary.DEFAULT },
  viewDetailsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: spacing[1] },
  viewDetailsRowRTL: { flexDirection: 'row-reverse', justifyContent: 'flex-start' },
  viewDetailsText: { fontSize: typography.fontSize.sm, fontFamily: fonts.medium, color: colors.primary.DEFAULT },
});
