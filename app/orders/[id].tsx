import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useOrder } from '../../src/hooks/useOrders';
import { colors, typography, fonts, spacing, commonStyles } from '../../src/theme';
import { Card, Button } from '../../src/components/ui';
import { format } from 'date-fns';
import { useRTL } from '../../src/hooks/useRTL';

const STATUS_TIMELINE = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
const STATUS_ICONS = {
  pending: 'time-outline', confirmed: 'checkmark-circle-outline', processing: 'sync-outline',
  shipped: 'airplane-outline', delivered: 'checkmark-done-circle', cancelled: 'close-circle-outline',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { data: order, isLoading } = useOrder(id);

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: t('orders.status.pending'), confirmed: t('orders.status.confirmed'),
      processing: t('orders.status.processing'), shipped: t('orders.status.shipped'),
      delivered: t('orders.status.delivered'), cancelled: t('orders.status.cancelled'),
    };
    return labels[status] || status;
  };

  if (isLoading) return <View style={styles.loadingContainer}><Text style={styles.loadingText}>{t('common.loading')}</Text></View>;
  if (!order) return (
    <View style={styles.errorContainer}>
      <Ionicons name="alert-circle-outline" size={80} color={colors.status.error.text} />
      <Text style={styles.errorText}>{t('orders.detail.not_found')}</Text>
      <Button title={t('orders.detail.back_to_orders')} onPress={() => router.back()} />
    </View>
  );

  const currentStatusIndex = STATUS_TIMELINE.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `#${order.order_number}` }} />

      <Text style={[styles.title, isRTL && commonStyles.rtlText]}>Order #{order.order_number}</Text>
      <Text style={[styles.date, isRTL && commonStyles.rtlText]}>{format(new Date(order.created_at), 'MMMM dd, yyyy • HH:mm')}</Text>

      {/* Order Timeline */}
      <Card style={styles.timelineCard}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('orders.detail.order_status')}</Text>
        {isCancelled ? (
          <View style={styles.cancelledContainer}>
            <Ionicons name="close-circle" size={48} color={colors.status.error.text} />
            <Text style={styles.cancelledText}>{t('orders.detail.cancelled_message')}</Text>
          </View>
        ) : (
          <View style={[styles.timeline, isRTL && styles.timelineRTL]}>
            {STATUS_TIMELINE.map((status, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const isLast = index === STATUS_TIMELINE.length - 1;
              return (
                <View key={status} style={[styles.timelineItem, isRTL && commonStyles.rowReverse]}>
                  <View style={[styles.timelineLeft, isRTL && styles.timelineLeftRTL]}>
                    <View style={[styles.timelineIcon, isCompleted && styles.timelineIconCompleted, isCurrent && styles.timelineIconCurrent]}>
                      <Ionicons name={STATUS_ICONS[status]} size={20} color={isCompleted ? colors.primary.foreground : colors.muted.foreground} />
                    </View>
                    {!isLast && <View style={[styles.timelineLine, isCompleted && styles.timelineLineCompleted]} />}
                  </View>
                  <View style={styles.timelineRight}>
                    <Text style={[styles.timelineLabel, isCompleted && styles.timelineLabelCompleted, isRTL && commonStyles.rtlText]}>{getStatusLabel(status)}</Text>
                    {order.status_history?.[status] && (
                      <Text style={[styles.timelineTime, isRTL && commonStyles.rtlText]}>{format(new Date(order.status_history[status]), 'MMM dd, HH:mm')}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </Card>

      {/* Shipping Information */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('orders.detail.shipping_info')}</Text>
        <View style={[styles.infoRow, isRTL && commonStyles.rowReverse]}>
          <Ionicons name="person-outline" size={20} color={colors.muted.foreground} />
          <Text style={[styles.infoText, isRTL && commonStyles.rtlText]}>{order.shipping_address.fullName}</Text>
        </View>
        <View style={[styles.infoRow, isRTL && commonStyles.rowReverse]}>
          <Ionicons name="call-outline" size={20} color={colors.muted.foreground} />
          <Text style={[styles.infoText, isRTL && commonStyles.rtlText]}>{order.shipping_address.phone}</Text>
        </View>
        <View style={[styles.infoRow, isRTL && commonStyles.rowReverse]}>
          <Ionicons name="location-outline" size={20} color={colors.muted.foreground} />
          <Text style={[styles.infoText, isRTL && commonStyles.rtlText]}>
            {order.shipping_address.city}{order.shipping_address.address && `, ${order.shipping_address.address}`}
          </Text>
        </View>
      </Card>

      {/* Order Items */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('orders.detail.order_items')}</Text>
        {order.items.map((item) => (
          <View key={item.id} style={[styles.itemRow, isRTL && commonStyles.rowReverse]}>
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
          </View>
        ))}
      </Card>

      {/* Order Summary */}
      <Card style={styles.card}>
        <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('orders.detail.order_summary')}</Text>

        <View style={[styles.summaryRow, isRTL && commonStyles.rowReverse]}>
          <Text style={[styles.summaryLabel, isRTL && commonStyles.rtlText]}>{t('checkout.subtotal')}</Text>
          <Text style={styles.summaryValue}>€{(order.total_eur - order.shipping_fee + (order.discount_amount || 0)).toFixed(2)}</Text>
        </View>

        {order.discount_amount && order.discount_amount > 0 && (
          <View style={[styles.summaryRow, isRTL && commonStyles.rowReverse]}>
            <Text style={[styles.summaryLabel, styles.discountLabel, isRTL && commonStyles.rtlText]}>{t('checkout.discount')} {order.coupon_code && `(${order.coupon_code})`}</Text>
            <Text style={[styles.summaryValue, styles.discountValue]}>-€{order.discount_amount.toFixed(2)}</Text>
          </View>
        )}

        <View style={[styles.summaryRow, isRTL && commonStyles.rowReverse]}>
          <Text style={[styles.summaryLabel, isRTL && commonStyles.rtlText]}>{t('checkout.shipping')}</Text>
          <Text style={styles.summaryValue}>€{order.shipping_fee.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryRow, styles.totalRow, isRTL && commonStyles.rowReverse]}>
          <Text style={[styles.totalLabel, isRTL && commonStyles.rtlText]}>{t('cart.total')}</Text>
          <Text style={styles.totalValue}>€{order.total_eur.toFixed(2)}</Text>
        </View>

        {order.deposit_amount && order.deposit_amount > 0 && (
          <>
            <View style={styles.divider} />
            <View style={[styles.summaryRow, isRTL && commonStyles.rowReverse]}>
              <Text style={[styles.depositLabel, isRTL && commonStyles.rtlText]}>{t('checkout.deposit')}</Text>
              <Text style={styles.depositValue}>€{order.deposit_amount.toFixed(2)}</Text>
            </View>
          </>
        )}

        <View style={[styles.paymentMethodRow, isRTL && commonStyles.rowReverse]}>
          <Ionicons name="cash-outline" size={20} color={colors.muted.foreground} />
          <Text style={[styles.paymentMethodText, isRTL && commonStyles.rtlText]}>{t('orders.detail.payment_method')}</Text>
        </View>
      </Card>

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
  backButton: { marginBottom: spacing[4] },
  title: { fontSize: typography.fontSize['3xl'], fontFamily: fonts.bold, color: colors.foreground, marginBottom: spacing[1] },
  date: { fontSize: typography.fontSize.base, color: colors.muted.foreground, marginBottom: spacing[6], fontFamily: fonts.regular },
  card: { marginBottom: spacing[3] },
  timelineCard: { marginBottom: spacing[3] },
  sectionTitle: { fontSize: typography.fontSize.lg, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[4] },
  cancelledContainer: { alignItems: 'center', paddingVertical: spacing[6] },
  cancelledText: { fontSize: typography.fontSize.xl, fontFamily: fonts.semibold, color: colors.status.error.text, marginTop: spacing[3] },
  timeline: { paddingLeft: spacing[2] },
  timelineRTL: { paddingLeft: 0, paddingRight: spacing[2] },
  timelineItem: { flexDirection: 'row', minHeight: 60 },
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
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[3], marginBottom: spacing[3] },
  infoText: { fontSize: typography.fontSize.base, color: colors.foreground, flex: 1, fontFamily: fonts.regular },
  itemRow: { flexDirection: 'row', marginBottom: spacing[4], paddingBottom: spacing[4], borderBottomWidth: 1, borderBottomColor: colors.border },
  itemImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: colors.muted.DEFAULT },
  placeholderImage: { justifyContent: 'center', alignItems: 'center' },
  itemInfo: { flex: 1, marginLeft: spacing[3] },
  itemInfoRTL: { marginLeft: 0, marginRight: spacing[3] },
  itemName: { fontSize: typography.fontSize.base, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[1] },
  itemDetails: { fontSize: typography.fontSize.sm, color: colors.muted.foreground, marginBottom: spacing[1], fontFamily: fonts.regular },
  itemQuantity: { fontSize: typography.fontSize.sm, color: colors.muted.foreground, fontFamily: fonts.regular },
  itemPrice: { fontSize: typography.fontSize.base, fontFamily: fonts.bold, color: colors.primary.DEFAULT },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] },
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
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginTop: spacing[4], paddingTop: spacing[4], borderTopWidth: 1, borderTopColor: colors.border },
  paymentMethodText: { fontSize: typography.fontSize.base, color: colors.muted.foreground, fontFamily: fonts.regular },
  helpCard: { marginTop: spacing[2] },
  helpTitle: { fontSize: typography.fontSize.base, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[2] },
  helpText: { fontSize: typography.fontSize.sm, color: colors.muted.foreground, lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm, fontFamily: fonts.regular },
  bottomSpacing: { height: spacing[6] },
});
