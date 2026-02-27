import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Input, Card } from '../../src/components/ui';
import { useCartStore } from '../../src/store/cartStore';
import { useAuthStore } from '../../src/store/authStore';
import { useCartTotals } from '../../src/hooks/useCartTotals';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../src/theme';
import { validateCoupon, placeOrder, type CouponValidation } from '../../src/api/endpoints/checkout';
import { getDepositRates } from '../../src/api/endpoints/config';
import { DEPOSIT_RATES, roundDepositAmount } from '../../src/lib/checkout-config';
import { LoyaltyTier } from '../../src/types/user';
import { useRTL } from '../../src/hooks/useRTL';
import { useRequireAuth } from '../../src/hooks/useRequireAuth';
import { useToast } from '../../src/hooks/useToast';
import { TOP_CITIES } from '../../src/utils/cities';

const normalizeDigits = (text: string): string => {
  const latinized = text.replace(/[٠-٩]/g, (d) =>
    String.fromCharCode(d.charCodeAt(0) - 0x0660 + 0x0030)
  );
  return latinized.replace(/[^0-9]/g, '');
};

const stripPhonePrefix = (phone: string): string =>
  phone.replace(/^\+218/, '');

const baseSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  city: z.string(),
  address: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof baseSchema>;

export default function CheckoutScreen() {
  const isAuthenticated = useRequireAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const insets = useSafeAreaInsets();

  if (!isAuthenticated) return null;
  const { items, clearCart } = useCartStore();
  const { total: cartTotal } = useCartTotals();
  const { userData } = useAuthStore();
  const toast = useToast();

  const [depositRates, setDepositRates] = useState<Record<LoyaltyTier, number>>(DEPOSIT_RATES);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<CouponValidation['discount'] | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const checkoutSchema = React.useMemo(() => z.object({
    fullName: z.string().min(2, t('checkout.error.required_name')),
    phone: z.string().regex(/^9[0-9]{8}$/, t('checkout.error.invalid_phone')),
    city: z.string().min(1, t('checkout.error.required_city')),
    address: z.string().optional(),
  }), [t]);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: userData?.name || '',
      phone: stripPhonePrefix(userData?.phone || ''),
      city: userData?.city || '',
      address: '',
    },
  });

  useEffect(() => {
    getDepositRates().then(setDepositRates);
  }, []);

  useEffect(() => {
    if (userData) {
      setValue('fullName', userData.name || '');
      setValue('phone', stripPhonePrefix(userData.phone || ''));
      if (userData.city) setValue('city', userData.city);
    }
  }, [userData, setValue]);

  const shippingFee = 0;

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
  const depositRate = depositRates[currentTier] || 50;
  const depositAmount = roundDepositAmount((conciergeSubtotal * depositRate) / 100);
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
      setCouponError(result.error || t('checkout.coupon.invalid'));
      setAppliedDiscount(null);
    }
    setIsApplyingCoupon(false);
  };

  const onSubmit = async (data: CheckoutFormData) => {
    setIsSubmitting(true);
    try {
      const result = await placeOrder({
        ...data,
        phone: `+218${data.phone}`,
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('checkout.error.place_order'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Stack.Screen options={{ title: t('checkout.title') }} />
        <Text style={styles.emptyText}>{t('cart.empty')}</Text>
        <Button title={t('cart.continue_shopping')} onPress={() => router.push('/(tabs)')} style={styles.button} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: t('checkout.title') }} />
      <View style={styles.content}>
        <Text style={[styles.subtitle, isRTL && commonStyles.rtlText]}>{t('checkout.subtitle')}</Text>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('checkout.delivery_info')}</Text>

          <Controller control={control} name="fullName" render={({ field: { onChange, value } }) => (
            <Input label={t('checkout.full_name_label')} value={value} onChangeText={onChange} error={errors.fullName?.message} placeholder={t('checkout.full_name_placeholder')} />
          )} />

          <Controller control={control} name="phone" render={({ field: { onChange, value } }) => (
            <View style={styles.phoneFieldContainer}>
              <Text style={[styles.inputLabel, isRTL && commonStyles.rtlText]}>{t('checkout.phone_label')}</Text>
              <View style={styles.phoneRow}>
                <View style={styles.phonePrefix}>
                  <Text style={styles.phonePrefixText}>+218</Text>
                </View>
                <View style={styles.phoneInputWrapper}>
                  <Input
                    placeholder={t('checkout.phone_placeholder')}
                    value={value}
                    onChangeText={(text) => onChange(normalizeDigits(text))}
                    keyboardType="number-pad"
                    autoComplete="tel"
                    maxLength={9}
                    textAlign="left"
                    style={styles.phoneInput}
                    error={errors.phone?.message}
                  />
                </View>
              </View>
            </View>
          )} />

          <Controller control={control} name="city" render={({ field: { onChange, value } }) => (
            <View style={styles.cityContainer}>
              <Text style={[styles.inputLabel, isRTL && commonStyles.rtlText]}>{t('checkout.city_label')}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cityScroll}>
                {TOP_CITIES.map((cityName) => (
                  <Pressable key={cityName} onPress={() => onChange(cityName)} style={[styles.cityChip, isRTL && styles.cityChipRTL, value === cityName && styles.cityChipSelected]}>
                    <Text style={[styles.cityChipText, value === cityName && styles.cityChipTextSelected]}>{cityName}</Text>
                  </Pressable>
                ))}
                <Pressable onPress={() => onChange('أخرى')} style={[styles.cityChip, isRTL && styles.cityChipRTL, value === 'أخرى' && styles.cityChipSelected]}>
                  <Text style={[styles.cityChipText, value === 'أخرى' && styles.cityChipTextSelected]}>{t('checkout.city_other') || 'أخرى'}</Text>
                </Pressable>
              </ScrollView>
              {errors.city && <Text style={styles.errorText}>{errors.city.message}</Text>}
              
              {value === 'أخرى' && (
                <View style={{ marginTop: spacing[3] }}>
                  <Input 
                    placeholder={t('checkout.custom_city_placeholder') || 'اسم المدينة...'}
                    onChangeText={(text) => {
                      // We handle custom string logic outside of main validation or handle using same field
                      // Keep it simple since Schema just expects a string "city" 
                      onChange(text);
                    }}
                  />
                </View>
              )}
            </View>
          )} />

          <Controller control={control} name="address" render={({ field: { onChange, value } }) => (
            <Input label={t('checkout.address_label')} value={value} onChangeText={onChange} placeholder={t('checkout.address_placeholder')} multiline />
          )} />
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('checkout.coupon.label')}</Text>
          {appliedDiscount ? (
            <View style={[styles.couponApplied, isRTL && commonStyles.rowReverse]}>
              <Text style={[styles.couponAppliedText, isRTL && commonStyles.rtlText]}>
                {appliedDiscount.code} - {appliedDiscount.type === 'percentage' ? `${appliedDiscount.value}%` : `€${appliedDiscount.value}`} {t('checkout.coupon.off')}
              </Text>
              <Pressable onPress={() => { setAppliedDiscount(null); setCouponCode(''); }}>
                <Text style={styles.removeCoupon}>{t('checkout.coupon.remove')}</Text>
              </Pressable>
            </View>
          ) : (
            <View style={[styles.couponRow, isRTL && commonStyles.rowReverse]}>
              <Input 
                value={couponCode} 
                onChangeText={(text) => { setCouponCode(text); setCouponError(''); }} 
                placeholder={t('checkout.coupon.placeholder')} 
                error={couponError} 
                containerStyle={styles.couponInputContainer} 
              />
              <Button title={t('checkout.coupon.apply')} onPress={handleApplyCoupon} loading={isApplyingCoupon} size="md" style={styles.couponButton} />
            </View>
          )}
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>{t('checkout.order_summary')}</Text>

          <View style={[styles.summaryRow, isRTL && commonStyles.rowReverse]}>
            <Text style={[styles.summaryLabel, isRTL && commonStyles.rtlText]}>{t('checkout.subtotal')} ({items.length} {t('checkout.items')})</Text>
            <Text style={styles.summaryValue}>€{subtotal.toFixed(2)}</Text>
          </View>

          {discountAmount > 0 && (
            <View style={[styles.summaryRow, isRTL && commonStyles.rowReverse]}>
              <Text style={[styles.summaryLabel, isRTL && commonStyles.rtlText]}>{t('checkout.discount')}</Text>
              <Text style={[styles.summaryValue, styles.discountValue]}>-€{discountAmount.toFixed(2)}</Text>
            </View>
          )}



          {requiresDeposit && (
            <View style={styles.depositInfo}>
              <Text style={[styles.depositText, isRTL && commonStyles.rtlText]}>{t('checkout.deposit_required')} ({depositRate}%): €{depositAmount.toFixed(2)}</Text>
              <Text style={[styles.depositSubtext, isRTL && commonStyles.rtlText]}>{t('checkout.deposit_note')}</Text>
            </View>
          )}

          <View style={[styles.summaryRow, styles.totalRow, isRTL && commonStyles.rowReverse]}>
            <Text style={[styles.totalLabel, isRTL && commonStyles.rtlText]}>{t('checkout.total')}</Text>
            <Text style={styles.totalValue}>€{total.toFixed(2)}</Text>
          </View>
        </Card>

        <View style={[styles.checkoutFooter, { paddingBottom: Math.max(insets.bottom, spacing[6]) }]}>
          <Button title={isSubmitting ? t('checkout.placing_order') : t('checkout.place_order')} onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} size="lg" style={styles.submitButton} />
          <Text style={[styles.paymentNote, isRTL && commonStyles.rtlText]}>{t('checkout.payment_note')}</Text>
        </View>
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
  section: { marginBottom: spacing[4] },
  sectionTitle: { fontSize: 18, fontFamily: fonts.semibold, color: colors.foreground, marginBottom: spacing[4] },
  phoneFieldContainer: { marginBottom: 0 },
  phoneRow: { flexDirection: 'row', alignItems: 'flex-start' },
  phonePrefix: { height: 44, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12, backgroundColor: colors.secondary.DEFAULT, borderWidth: 1, borderColor: colors.input, borderTopLeftRadius: radius.lg, borderBottomLeftRadius: radius.lg, borderRightWidth: 0 },
  phonePrefixText: { fontSize: 14, fontFamily: fonts.bold, color: colors.foreground },
  phoneInputWrapper: { flex: 1 },
  phoneInput: { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 },
  cityContainer: { marginBottom: spacing[4] },
  inputLabel: { fontSize: 14, fontFamily: fonts.medium, color: colors.foreground, marginBottom: spacing[2] },
  cityScroll: { marginBottom: spacing[1] },
  cityChip: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, marginRight: spacing[2], backgroundColor: colors.background },
  cityChipRTL: { marginRight: 0, marginLeft: spacing[2] },
  cityChipSelected: { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.DEFAULT },
  cityChipText: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  cityChipTextSelected: { color: colors.primary.foreground, fontFamily: fonts.medium },
  errorText: { fontSize: 12, color: colors.destructive.DEFAULT, marginTop: spacing[1] },
  couponRow: { flexDirection: 'row', gap: spacing[2], alignItems: 'flex-start' },
  couponInputContainer: { flex: 1, marginBottom: 0 },
  couponButton: { marginTop: 0 },
  couponApplied: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing[3], backgroundColor: colors.status.success.bg, borderRadius: radius.md },
  couponAppliedText: { fontSize: 14, color: colors.status.success.text, fontFamily: fonts.medium },
  removeCoupon: { fontSize: 14, color: colors.destructive.DEFAULT, fontFamily: fonts.medium },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing[2] },
  summaryLabel: { fontSize: 14, color: colors.muted.foreground, fontFamily: fonts.regular },
  summaryValue: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  discountValue: { color: colors.status.success.text },
  depositInfo: { padding: spacing[3], backgroundColor: colors.status.warning.bg, borderRadius: radius.md, marginVertical: spacing[2] },
  depositText: { fontSize: 14, color: colors.status.warning.text, fontFamily: fonts.medium },
  depositSubtext: { fontSize: 12, color: colors.status.warning.text, fontFamily: fonts.regular, marginTop: spacing[1] },
  totalRow: { marginTop: spacing[3], paddingTop: spacing[3], borderTopWidth: 1, borderTopColor: colors.border },
  totalLabel: { fontSize: 18, fontFamily: fonts.bold, color: colors.foreground },
  totalValue: { fontSize: 24, fontFamily: fonts.bold, color: colors.primary.DEFAULT },
  checkoutFooter: { marginTop: spacing[4], paddingTop: spacing[4], borderTopWidth: 1, borderTopColor: colors.border },
  submitButton: { marginBottom: spacing[3] },
  paymentNote: { textAlign: 'center', fontSize: 13, color: colors.muted.foreground, fontFamily: fonts.regular },
});
