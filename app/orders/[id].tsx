import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../src/hooks/useOrders';
import { colors, typography, fonts, spacing, commonStyles } from '../../src/theme';
import { Card, Button, Row } from '../../src/components/ui';
import { format } from 'date-fns';
import { useRTL } from '../../src/hooks/useRTL';
import { useRequireAuth } from '../../src/hooks/useRequireAuth';
import type { Order, OrderItem } from '../../src/types/order';
import { OrderTrackingMap } from '../../src/components/orders/OrderTrackingMap';

const STATUS_TIMELINE = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'] as const;
const STATUS_ICONS: Record<string, string> = {
  pending: 'time-outline', confirmed: 'checkmark-circle-outline', processing: 'sync-outline',
  shipped: 'airplane-outline', delivered: 'checkmark-done-circle', cancelled: 'close-circle-outline',
};

// ─── Sub-components ───────────────────────────────────────────

function OrderTimeline({ order }: { order: Order }) {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const currentStatusIndex = STATUS_TIMELINE.indexOf(order.status as typeof STATUS_TIMELINE[number]);
  const isCancelled = order.status === 'cancelled';

  if (isCancelled) {
    return (
      <View style={styles.cancelledContainer}>
        <Ionicons name="close-circle" size={48} color={colors.status.error.text} />
        <Text style={styles.cancelledText}>{t('orders.detail.cancelled_message')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.timeline, isRTL && styles.timelineRTL]}>
      {STATUS_TIMELINE.map((status, index) => {
        const isCompleted = index <= currentStatusIndex;
        const isCurrent = index === currentStatusIndex;
        const isLast = index === STATUS_TIMELINE.length - 1;
        return (
          <Row key={status} style={styles.timelineItem}>
            <View style={[styles.timelineLeft, isRTL && styles.timelineLeftRTL]}>
              <View style={[styles.timelineIcon, isCompleted && styles.timelineIconCompleted, isCurrent && styles.timelineIconCurrent]}>
                <Ionicons name={STATUS_ICONS[status] as any} size={20} color={isCompleted ? colors.primary.foreground : colors.muted.foreground} />
              </View>
              {!isLast && <View style={[styles.timelineLine, isCompleted && styles.timelineLineCompleted]} />}
            </View>
            <View style={styles.timelineRight}>
              <Text style={[styles.timelineLabel, isCompleted && styles.timelineLabelCompleted, isRTL && commonStyles.rtlText]}>{t(`orders.status.${status}`)}</Text>
              {order.status_history?.[status] && (
                <Text style={[styles.timelineTime, isRTL && commonStyles.rtlText]}>{format(new Date(order.status_history[status]), 'MMM dd, HH:mm')}</Text>
              )}
            </View>
          </Row>
        );
      })}
    </View>
  );
}

function ShippingInfo({ address }: { address: Order['shipping_address'] }) {
  const { t } = useTranslation();
  const isRTL = useRTL();

  const rows = [
    { icon: 'person-outline', text: address.fullName },
    { icon: 'call-outline', text: address.phone },
    { icon: 'location-outline', text: `${address.city}${address.address ? `, ${address.address}` : ''}` },
  ] as const;

  return (
    <Card style={styles.card}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('orders.detail.shipping_info')}</Text>
      {rows.map((row) => (
        <Row key={row.icon} gap={spacing[3]} style={styles.infoRowSpacing}>
          <Ionicons name={row.icon} size={20} color={colors.muted.foreground} />
          <Text style={[styles.infoText, isRTL && commonStyles.rtlText]}>{row.text}</Text>
        </Row>
      ))}
    </Card>
  );
}

function OrderItemRow({ item }: { item: OrderItem }) {
  const { t } = useTranslation();
  const isRTL = useRTL();

  return (
    <Row style={styles.itemRow}>
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.itemImage} />
      ) : (
        <View style={[styles.itemImage, styles.placeholderImage]}>
          <Ionicons name="image-outline" size={24} color={colors.muted.foreground} />
        </View>
      )}
      <View style={[styles.itemInfo, isRTL && styles.itemInfoRTL]}>
        <Text style={[styles.itemName, isRTL && commonStyles.rtlText]} numberOfLines={2}>{item.product_name}</Text>
        <Text style={[styles.itemDetails, isRTL && commonStyles.rtlText]}>{item.color} • {item.size}</Text>
        <Text style={[styles.itemQuantity, isRTL && commonStyles.rtlText]}>{t('orders.detail.quantity', { quantity: item.quantity })}</Text>
      </View>
      <Text style={styles.itemPrice}>€{(item.price_eur * item.quantity).toFixed(2)}</Text>
    </Row>
  );
}

function OrderSummary({ order }: { order: Order }) {
  const { t } = useTranslation();
  const isRTL = useRTL();
  const subtotal = order.total_eur - order.shipping_fee + (order.discount_amount || 0);

  return (
    <Card style={styles.card}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('orders.detail.order_summary')}</Text>

      <Row justify="space-between" style={styles.summaryRowSpacing}>
        <Text style={[styles.summaryLabel, isRTL && commonStyles.rtlText]}>{t('checkout.subtotal')}</Text>
        <Text style={styles.summaryValue}>€{subtotal.toFixed(2)}</Text>
      </Row>

      {order.discount_amount != null && order.discount_amount > 0 && (
        <Row justify="space-between" style={styles.summaryRowSpacing}>
          <Text style={[styles.summaryLabel, styles.discountLabel, isRTL && commonStyles.rtlText]}>{t('checkout.discount')} {order.coupon_code && `(${order.coupon_code})`}</Text>
          <Text style={[styles.summaryValue, styles.discountValue]}>-€{order.discount_amount.toFixed(2)}</Text>
        </Row>
      )}

      <Row justify="space-between" style={styles.summaryRowSpacing}>
        <Text style={[styles.summaryLabel, isRTL && commonStyles.rtlText]}>{t('checkout.shipping')}</Text>
        <Text style={styles.summaryValue}>€{order.shipping_fee.toFixed(2)}</Text>
      </Row>

      <Row justify="space-between" style={[styles.summaryRowSpacing, styles.totalRow]}>
        <Text style={[styles.totalLabel, isRTL && commonStyles.rtlText]}>{t('cart.total')}</Text>
        <Text style={styles.totalValue}>€{order.total_eur.toFixed(2)}</Text>
      </Row>

      {order.deposit_amount != null && order.deposit_amount > 0 && (
        <>
          <View style={styles.divider} />
          <Row justify="space-between" style={styles.summaryRowSpacing}>
            <Text style={[styles.depositLabel, isRTL && commonStyles.rtlText]}>{t('checkout.deposit')}</Text>
            <Text style={styles.depositValue}>€{order.deposit_amount.toFixed(2)}</Text>
          </Row>
        </>
      )}

      <Row gap={spacing[2]} style={styles.paymentMethodRow}>
        <Ionicons name="cash-outline" size={20} color={colors.muted.foreground} />
        <Text style={[styles.paymentMethodText, isRTL && commonStyles.rtlText]}>{t('orders.detail.payment_method')}</Text>
      </Row>
    </Card>
  );
}

// ─── Main Screen ──────────────────────────────────────────────

export default function OrderDetailScreen() {
  const isAuthenticated = useRequireAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { data: order, isLoading } = useOrder(id);

  if (!isAuthenticated) return null;

  if (isLoading) return <View style={styles.loadingContainer}><Text style={styles.loadingText}>{t('common.loading')}</Text></View>;
  if (!order) return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={80} color={colors.status.error.text} />
      <Text style={styles.errorText}>{t('orders.detail.not_found')}</Text>
      <Button title={t('orders.detail.back_to_orders')} onPress={() => router.back()} />
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `#${order.order_number}` }} />

      <Text style={[styles.title, isRTL && commonStyles.rtlText]}>Order #{order.order_number}</Text>
      <Text style={[styles.date, isRTL && commonStyles.rtlText]}>{format(new Date(order.created_at), 'MMMM dd, yyyy • HH:mm')}</Text>

      <Card style={styles.timelineCard}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('orders.detail.order_status')}</Text>
        <OrderTimeline order={order} />
      </Card>

      {(order.status === 'shipped' || order.status === 'delivered') && (
        <OrderTrackingMap order={order} />
      )}

      <ShippingInfo address={order.shipping_address} />

      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('orders.detail.order_items')}</Text>
        {order.items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}
      </Card>

      <OrderSummary order={order} />

      <Card style={styles.helpCard}>
        <Text style={[styles.helpTitle, isRTL && commonStyles.rtlText]}>{t('orders.detail.help_title')}</Text>
        <Text style={[styles.helpText, isRTL && commonStyles.rtlText]}>{t('orders.detail.help_text')}</Text>
      </Card>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing[4] },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  loadingText: { fontSize: typography.fontSize.base, color: colors.muted.foreground, fontFamily: fonts.regular },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6], backgroundColor: colors.background },
  errorText: { fontSize: 24, fontFamily: fonts.semibold, color: colors.foreground, marginTop: spacing[4], marginBottom: spacing[8] },
  title: { fontSize: typography.fontSize['3xl'], fontFamily: fonts.bold, color: colors.foreground, marginBottom: spacing[1] },
  date: { fontSize: typography.fontSize.base, color: colors.muted.foreground, marginBottom: spacing[6], fontFamily: fonts.regular },
  card: { marginBottom: spacing[3] },
  timelineCard: { marginBottom: spacing[3] },
  sectionTitle: { fontSize: typography.fontSize.lg, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[4] },
  cancelledContainer: { alignItems: 'center', paddingVertical: spacing[6] },
  cancelledText: { fontSize: typography.fontSize.xl, fontFamily: fonts.semibold, color: colors.status.error.text, marginTop: spacing[3] },
  timeline: { paddingLeft: spacing[2] },
  timelineRTL: { paddingLeft: 0, paddingRight: spacing[2] },
  timelineItem: { minHeight: 60 },
  timelineLeft: { alignItems: 'center', marginRight: spacing[4] },
  timelineLeftRTL: { marginRight: 0, marginLeft: spacing[4] },
  timelineIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.muted.DEFAULT, justifyContent: 'center', alignItems: 'center' },
  timelineIconCompleted: { backgroundColor: colors.primary.DEFAULT },
  timelineIconCurrent: { backgroundColor: colors.primary.DEFAULT, borderWidth: 3, borderColor: colors.primary.DEFAULT + '30' },
  timelineLine: { width: 2, flex: 1, backgroundColor: colors.border, marginVertical: spacing[1] },
  timelineLineCompleted: { backgroundColor: colors.primary.DEFAULT },
  timelineRight: { flex: 1, justifyContent: 'center', paddingBottom: spacing[2] },
  timelineLabel: { fontSize: typography.fontSize.base, fontFamily: fonts.medium, color: colors.muted.foreground, marginBottom: spacing[1] },
  timelineLabelCompleted: { color: colors.foreground, fontFamily: fonts.semibold },
  timelineTime: { fontSize: typography.fontSize.sm, color: colors.muted.foreground, fontFamily: fonts.regular },
  infoRowSpacing: { marginBottom: spacing[3] },
  infoText: { fontSize: typography.fontSize.base, color: colors.foreground, flex: 1, fontFamily: fonts.regular },
  itemRow: { marginBottom: spacing[4], paddingBottom: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: colors.muted.DEFAULT },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: spacing[3] },
  itemInfoRTL: { marginLeft: 0, marginRight: spacing[3] },
  itemName: { fontSize: typography.fontSize.base, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[1] },
  itemDetails: { fontSize: typography.fontSize.sm, color: colors.muted.foreground, marginBottom: spacing[1], fontFamily: fonts.regular },
  itemQuantity: { fontSize: typography.fontSize.sm, color: colors.muted.foreground, fontFamily: fonts.regular },
  itemPrice: { fontSize: typography.fontSize.base, fontFamily: fonts.bold, color: colors.primary.DEFAULT },
  summaryRowSpacing: { marginBottom: spacing[2] },
  summaryLabel: { fontSize: typography.fontSize.base, color: colors.foreground, fontFamily: fonts.regular },
  summaryValue: { fontSize: typography.fontSize.base, fontFamily: fonts.medium, color: colors.foreground },
  discountLabel: { color: colors.status.success.text },
  discountValue: { color: colors.status.success.text },
  totalRow: { paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing[2] },
  totalLabel: { fontSize: typography.fontSize.lg, fontFamily: fonts.semibold, color: colors.foreground },
  totalValue: { fontSize: typography.fontSize['2xl'], fontFamily: fonts.bold, color: colors.primary.DEFAULT },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing[3] },
  depositLabel: { fontSize: typography.fontSize.base, fontFamily: fonts.medium, color: colors.primary.DEFAULT },
  depositValue: { fontSize: typography.fontSize.lg, fontFamily: fonts.bold, color: colors.primary.DEFAULT },
  paymentMethodRow: { marginTop: spacing[4], paddingTop: spacing[4], borderTopWidth: 1, borderTopColor: colors.border },
  paymentMethodText: { fontSize: typography.fontSize.base, color: colors.muted.foreground, fontFamily: fonts.regular },
  helpCard: { marginTop: spacing[2] },
  helpTitle: { fontSize: typography.fontSize.base, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[2] },
  helpText: { fontSize: typography.fontSize.sm, color: colors.muted.foreground, lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm, fontFamily: fonts.regular },
  bottomSpacing: { height: spacing[6] },
});
