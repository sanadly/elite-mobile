import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../src/components/ui';
import { colors, typography, fonts, spacing } from '../src/theme';

export default function OrderSuccessScreen() {
  const { orderNumber } = useLocalSearchParams<{ orderNumber: string }>();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={80} color={colors.status.success.text} />
        </View>

        <Text style={styles.title}>{t('order_success.title')}</Text>
        <Text style={styles.subtitle}>{t('order_success.subtitle')}</Text>

        {orderNumber && (
          <View style={styles.orderNumberCard}>
            <Text style={styles.orderNumberLabel}>{t('order_success.order_number')}</Text>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>
        )}

        <Text style={styles.message}>
          {t('order_success.message')}
        </Text>

        <Text style={styles.paymentInfo}>
          {t('order_success.payment_info')}
        </Text>

        <Button
          title={t('order_success.continue_shopping')}
          onPress={() => router.push('/(tabs)')}
          size="lg"
          style={styles.button}
        />

        <Button
          title={t('order_success.view_orders')}
          onPress={() => router.push('/(tabs)/account')}
          variant="outline"
          size="lg"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  title: {
    fontSize: 30,
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginBottom: spacing[6],
    textAlign: 'center',
  },
  orderNumberCard: {
    backgroundColor: colors.luxury.offWhite,
    padding: spacing[4],
    borderRadius: 12,
    marginBottom: spacing[6],
    alignItems: 'center',
  },
  orderNumberLabel: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginBottom: spacing[1],
  },
  orderNumber: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
    letterSpacing: 1,
  },
  message: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: spacing[4],
    lineHeight: typography.lineHeight.relaxed * 16,
  },
  paymentInfo: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginBottom: spacing[8],
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginTop: spacing[2],
  },
});
