import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Card } from '../../src/components/ui';
import { useCartStore } from '../../src/store/cartStore';
import { useAuthStore } from '../../src/store/authStore';
import { colors, typography, fonts, spacing } from '../../src/theme';
import { validateCoupon, placeOrder, getCities } from '../../src/api/endpoints/checkout';
import { DEPOSIT_RATES } from '../../src/lib/checkout-config';
import { useRTL } from '../../src/hooks/useRTL';

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().min(8, 'Phone number is required'),
  city: z.string().min(1, 'City is required'),
  address: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { items, cartTotal, clearCart } = useCartStore();
  const { userData } = useAuthStore();

  const [cities, setCities] = useState<any[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: userData?.name || '',
      phone: userData?.phone || '',
      city: userData?.city || '',
      address: '',
    },
  });

  useEffect(() => {
    getCities().then(setCities).finally(() => setLoadingCities(false));
  }, []);

  useEffect(() => {
    if (userData) {
      setValue('fullName', userData.name || '');
      setValue('phone', userData.phone || '');
      if (userData.city) setValue('city', userData.city);
    }
  }, [userData, setValue]);

  const selectedCity = watch('city');
  const cityData = cities.find(c => c.city_name === selectedCity);
  const shippingFee = cityData?.fee_local || 0;

  const subtotal = cartTotal;
  const discountAmount = appliedDiscount
    ? appliedDiscount.type === 'percentage'
      ? Math.round(subtotal * (appliedDiscount.value / 100) * 100) / 100
      : appliedDiscount.value
    : 0;
  const total = subtotal - discountAmount + shippingFee;

  const conciergeItems = items.filter(item => item.isConcierge);
  const conciergeSubtotal = conciergeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const currentTier = userData?.loyaltyTier || 'classic';
  const depositRate = DEPOSIT_RATES[currentTier] || 50;
  const depositAmount = (conciergeSubtotal * depositRate) / 100;
  const requiresDeposit = depositRate > 0 && conciergeSubtotal > 0;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError('');

    const result = await validateCoupon(couponCode.trim(), subtotal);

    if (result.valid && result.discount) {
      setAppliedDiscount(result.discount);
      setCouponError('');
    } else {
      setCouponError(result.error || 'Invalid coupon');
      setAppliedDiscount(null);
    }
    setIsApplyingCoupon(false);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const result = await placeOrder({
        ...data,
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price,
          name: item.name,
          image: item.image,
          size: item.size,
          color: item.color,
          isConcierge: item.isConcierge || false,
        })),
        totalEur: total,
        customerId: userData?.id,
        depositAmount: requiresDeposit ? depositAmount : 0,
        couponCode: appliedDiscount?.code,
        shippingFee,
      });

      if (result.success) {
        clearCart();
        router.push(`/order-success?orderNumber=${result.orderNumber}`);
      }
    } catch (error: any) {
      alert(error.message || 'Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{t('cart.empty')}</Text>
        <Button title={t('cart.continue_shopping')} onPress={() => router.push('/(tabs)')} style={styles.button} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={[styles.title, isRTL && styles.rtlText]}>{t('checkout.title')}</Text>
        <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t('checkout.subtitle')}</Text>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('checkout.delivery_info')}</Text>

          <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
            <Input label={t('checkout.full_name_label')} value={value} onChangeText={onChange} error={errors.fullName?.message} placeholder={t('checkout.full_name_placeholder')} />
          )} />

          <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
            <Input label={t('checkout.phone_label')} value={value} onChangeText={onChange} error={errors.phone?.message} placeholder={t('checkout.phone_placeholder')} keyboardType="phone-pad" />
          )} />

          {loadingCities ? (
            <ActivityIndicator />
          ) : (
            <Controller control={control} name="city" render={({ field: { onChange, value } }) => (
              <View style={styles.cityContainer}>
                <Text style={[styles.inputLabel, isRTL && styles.rtlText]}>{t('checkout.city_label')}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
                  {cities.map((city) => (
                    <Pressable key={city.id} onPress={() => onChange(city.city_name)} style={[styles.cityChip, isRTL && styles.cityChipRTL, value === city.city_name && styles.cityChipSelected]}>
                      <Text style={[styles.cityChipText, value === city.city_name && styles.cityChipTextSelected]}>{city.city_name}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
                {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
              </View>
            )} />
          )}

          <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
            <Input label={t('checkout.address_label')} value={value} onChangeText={onChange} placeholder={t('checkout.address_placeholder')} multiline />
          )} />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('checkout.coupon.label')}</Text>
          {appliedDiscount ? (
            <View style={[styles.couponApplied, isRTL && styles.rowReverse]}>
              <Text style={[styles.couponAppliedText, isRTL && styles.rtlText]}>
                {appliedDiscount.code} - {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `€${appliedDiscount.value}`} {t('checkout.coupon.off')}
              </Text>
              <Pressable onPress={() => { setAppliedDiscount(null); setCouponCode(''); }}>
                <Text style={styles.removeCoupon}>{t('checkout.coupon.remove')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.couponRow, isRTL && styles.rowReverse]}>
              <Input value={couponCode} onChangeText={(text) => { setCouponCode(text); setCouponError(''); }} placeholder={t('checkout.coupon.placeholder')} error={couponError} style={styles.couponInput} />
              <Button title={t('checkout.coupon.apply')} onPress={handleApplyCoupon} loading={isApplyingCoupon} size="md" style={styles.couponButton} />
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('checkout.order_summary')}</Text>

          <View style={[styles.summaryRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>{t('checkout.subtotal')} ({items.length} {t('checkout.items')})</Text>
            <Text style={styles.summaryValue}>€{subtotal.toFixed(2)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={[styles.summaryRow, isRTL && styles.rowReverse]}>
              <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>{t('checkout.discount')}</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>-€{discountAmount.toFixed(2)}</Text>
            </View>
          )}

          <View style={[styles.summaryRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.summaryLabel, isRTL && styles.rtlText]}>{t('checkout.shipping')}</Text>
            <Text style={styles.summaryValue}>€{shippingFee.toFixed(2)}</Text>
          </View>

          {requiresDeposit && (
            <View style={styles.depositInfo}>
              <Text style={[styles.depositText, isRTL && styles.rtlText]}>{t('checkout.deposit_required')} ({depositRate}%): €{depositAmount.toFixed(2)}</Text>
              <Text style={[styles.depositSubtext, isRTL && styles.rtlText]}>{t('checkout.deposit_note')}</Text>
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow, isRTL && styles.rowReverse]}>
            <Text style={[styles.totalLabel, isRTL && styles.rtlText]}>{t('checkout.total')}</Text>
            <Text style={styles.totalValue}>€{total.toFixed(2)}</Text>
          </View>
        </Card>

        <Button title={isSubmitting ? t('checkout.placing_order') : t('checkout.place_order')} onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} size="lg" style={styles.submitButton} />
        <Text style={styles.paymentNote}>{t('checkout.payment_note')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing[4] },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing[6] },
  emptyText: { fontSize: typography.fontSize.lg, color: colors.muted.foreground, fontFamily: fonts.regular, marginBottom: spacing[4] },
  button: { minWidth: 200 },
  title: { fontSize: 30, fontFamily: fonts.bold, color: colors.foreground, marginBottom: spacing[1] },
  subtitle: { fontSize: 14, color: colors.muted.foreground, fontFamily: fonts.regular, marginBottom: spacing[6] },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  rowReverse: { flexDirection: 'row-reverse' },
  section: { marginBottom: spacing[4] },
  sectionTitle: { fontSize: 18, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[4] },
  cityContainer: { marginBottom: spacing[4] },
  inputLabel: { fontSize: 14, fontFamily: fonts.medium, color: colors.foreground, marginBottom: spacing[2] },
  cityScroll: { marginBottom: spacing[1] },
  cityChip: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: 999, borderWidth: 1, borderColor: colors.border, marginRight: spacing[2], backgroundColor: colors.background },
  cityChipRTL: { marginRight: 0, marginLeft: spacing[2] },
  cityChipSelected: { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.DEFAULT },
  cityChipText: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  cityChipTextSelected: { color: colors.primary.foreground, fontFamily: fonts.medium },
  errorText: { fontSize: 12, color: colors.destructive.DEFAULT, marginTop: spacing[1] },
  couponRow: { flexDirection: 'row', gap: spacing[2], alignItems: 'flex-start' },
  couponInput: { flex: 1, marginBottom: 0 },
  couponButton: { marginTop: 22 },
  couponApplied: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[3], backgroundColor: colors.status.success.bg, borderRadius: 8 },
  couponAppliedText: { fontSize: 14, color: colors.status.success.text, fontFamily: fonts.medium },
  removeCoupon: { fontSize: 14, color: colors.destructive.DEFAULT, fontFamily: fonts.medium },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] },
  summaryLabel: { fontSize: 14, color: colors.muted.foreground, fontFamily: fonts.regular },
  summaryValue: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  discountValue: { color: colors.status.success.text },
  depositInfo: { padding: spacing[3], backgroundColor: colors.status.warning.bg, borderRadius: 8, marginVertical: spacing[2] },
  depositText: { fontSize: 14, color: colors.status.warning.text, fontFamily: fonts.medium },
  depositSubtext: { fontSize: 12, color: colors.status.warning.text, fontFamily: fonts.regular, marginTop: spacing[1] },
  totalRow: { marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: 18, fontFamily: fonts.bold, color: colors.foreground },
  totalValue: { fontSize: 24, fontFamily: fonts.bold, color: colors.primary.DEFAULT },
  submitButton: { marginTop: spacing[6], marginBottom: spacing[4] },
  paymentNote: { textAlign: 'center', fontSize: 14, color: colors.muted.foreground, fontFamily: fonts.regular, marginBottom: spacing[8] },
});
