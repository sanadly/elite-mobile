import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../src/hooks/useOrders';
import { colors, typography, fonts, spacing } from '../../src/theme';
import { Card, Button } from '../../src/components/ui';
import { SkeletonList } from '../../src/components/feedback';
import { format } from 'date-fns';
import { useRTL } from '../../src/hooks/useRTL';

const STATUS_COLORS = {
  pending: { bg: colors.status.pending.bg, text: colors.status.pending.text },
  confirmed: { bg: '#F0F9FF', text: '#0369A1' },
  processing: { bg: '#FEF3C7', text: '#D97706' },
  shipped: { bg: '#EDE9FE', text: '#7C3AED' },
  delivered: { bg: colors.status.success.bg, text: colors.status.success.text },
  cancelled: { bg: colors.status.error.bg, text: colors.status.error.text },
};

export default function OrdersScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { data: orders, isLoading, refetch, isRefetching } = useOrders();

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
        <SkeletonList count={5} type="order" />
      </View>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={80} color={colors.muted.foreground} />
        <Text style={styles.emptyText}>{t('orders.empty')}</Text>
        <Text style={styles.emptySubtext}>{t('orders.empty_subtitle')}</Text>
        <Button title={t('cart.continue_shopping')} onPress={() => router.push('/(tabs)')} size="lg" style={styles.button} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const statusColor = STATUS_COLORS[item.status];
          return (
            <Pressable onPress={() => router.push(`/orders/${item.id}`)}>
              <Card style={styles.orderCard}>
                <View style={[styles.orderHeader, isRTL && styles.rowReverse]}>
                  <View>
                    <Text style={[styles.orderNumber, isRTL && styles.rtlText]}>#{item.order_number}</Text>
                    <Text style={[styles.orderDate, isRTL && styles.rtlText]}>{format(new Date(item.created_at), 'MMM dd, yyyy • HH:mm')}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>{getStatusLabel(item.status)}</Text>
                  </View>
                </View>

                <View style={[styles.orderDetails, isRTL && styles.rowReverse]}>
                  <View style={[styles.detailRow, isRTL && styles.rowReverse]}>
                    <Ionicons name="location-outline" size={16} color={colors.muted.foreground} />
                    <Text style={[styles.detailText, isRTL && styles.rtlText]}>{item.shipping_address.city}</Text>
                  </View>
                  <View style={[styles.detailRow, isRTL && styles.rowReverse]}>
                    <Ionicons name="cash-outline" size={16} color={colors.muted.foreground} />
                    <Text style={[styles.detailText, isRTL && styles.rtlText]}>COD</Text>
                  </View>
                </View>

                <View style={[styles.orderFooter, isRTL && styles.rowReverse]}>
                  <Text style={[styles.totalLabel, isRTL && styles.rtlText]}>{t('orders.total')}</Text>
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
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6], backgroundColor: colors.background },
  emptyText: { fontSize: 24, fontFamily: fonts.semibold, color: colors.foreground, marginTop: spacing[4], marginBottom: spacing[2] },
  emptySubtext: { fontSize: 16, color: colors.muted.foreground, textAlign: 'center', marginBottom: spacing[8], fontFamily: fonts.regular },
  button: { width: '100%', maxWidth: 300 },
  list: { padding: spacing[4] },
  orderCard: { marginBottom: spacing[3] },
  rowReverse: { flexDirection: 'row-reverse' },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
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
