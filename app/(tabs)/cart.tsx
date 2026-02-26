import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCartStore } from '../../src/store/cartStore';
import { colors, typography, fonts, spacing, commonStyles } from '../../src/theme';
import { Card, Button, AvailabilityBadge, EmptyState } from '../../src/components/ui';
import { useRTL } from '../../src/hooks/useRTL';
import { useCartTotals } from '../../src/hooks/useCartTotals';

export default function CartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const insets = useSafeAreaInsets();
  const { items, removeItem, updateQuantity } = useCartStore();
  const { count: cartCount, total: cartTotal } = useCartTotals();

  if (items.length === 0) {
    return (
      <EmptyState
        icon="cart-outline"
        title={t('cart.empty')}
        subtitle={t('cart.empty_subtitle')}
        actionLabel={t('cart.continue_shopping')}
        onAction={() => router.push('/(tabs)')}
      />
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.variantId}
        renderItem={({ item }) => (
          <Card style={styles.cartItem}>
            <View style={[styles.itemRow, isRTL && commonStyles.rowReverse]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={24} color={colors.muted.foreground} />
                </View>
              )}

              <View style={[styles.itemInfo, isRTL && styles.itemInfoRTL]}>
                <Text style={[styles.itemName, isRTL && commonStyles.rtlText]} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.itemDetails, isRTL && commonStyles.rtlText]}>
                  {item.color} • {item.size}
                </Text>
                <View style={[styles.badgeRow, isRTL && commonStyles.rowReverse]}>
                  <AvailabilityBadge
                    type={item.isConcierge ? 'reservation' : 'immediate'}
                    size="sm"
                  />
                </View>
                <Text style={[styles.itemPrice, isRTL && commonStyles.rtlText]}>€{item.price.toFixed(2)}</Text>
              </View>

              <Pressable onPress={() => removeItem(item.variantId)} style={styles.removeButton}>
                <Ionicons name="trash-outline" size={20} color={colors.destructive.DEFAULT} />
              </Pressable>
            </View>

            {/* Quantity Controls */}
            <View style={[styles.quantityRow, isRTL && styles.quantityRowRTL]}>
              <Pressable
                onPress={() => updateQuantity(item.variantId, item.quantity - 1)}
                style={styles.quantityButton}
              >
                <Ionicons name="remove" size={20} color={colors.foreground} />
              </Pressable>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <Pressable
                onPress={() => updateQuantity(item.variantId, item.quantity + 1)}
                style={styles.quantityButton}
                disabled={!item.isConcierge && item.quantity >= item.maxStock}
              >
                <Ionicons name="add" size={20} color={colors.foreground} />
              </Pressable>
            </View>
          </Card>
        )}
        contentContainerStyle={styles.list}
      />

      {/* Footer with total and checkout button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, spacing[4]) }]}>
        <View style={[styles.totalRow, isRTL && commonStyles.rowReverse]}>
          <Text style={[styles.totalLabel, isRTL && commonStyles.rtlText]}>
            {t('cart.total')} ({t('cart.item_count', { count: cartCount })})
          </Text>
          <Text style={styles.totalAmount}>€{cartTotal.toFixed(2)}</Text>
        </View>
        <Button
          title={t('cart.proceed_to_checkout')}
          onPress={() => router.push('/checkout')}
          size="lg"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    padding: spacing[4],
  },
  cartItem: {
    marginBottom: spacing[3],
  },
  itemRow: {
    flexDirection: 'row',
    marginBottom: spacing[3],
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: colors.muted.DEFAULT,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
    marginLeft: spacing[3],
  },
  itemInfoRTL: {
    marginLeft: 0,
    marginRight: spacing[3],
  },
  itemName: {
    fontSize: 16,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    marginBottom: spacing[1],
  },
  itemDetails: {
    fontSize: 14,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginBottom: spacing[2],
  },
  itemPrice: {
    fontSize: 18,
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: spacing[2],
  },
  removeButton: {
    padding: spacing[2],
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  quantityRowRTL: {
    justifyContent: 'flex-start',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontFamily: fonts.medium,
    color: colors.foreground,
    marginHorizontal: spacing[4],
    minWidth: 30,
    textAlign: 'center',
  },
  footer: {
    padding: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  totalLabel: {
    fontSize: 18,
    fontFamily: fonts.medium,
    color: colors.foreground,
  },
  totalAmount: {
    fontSize: 24,
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
  },
});
