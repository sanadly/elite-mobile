import React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useCartStore } from '../../src/store/cartStore';
import { colors, typography, fonts, spacing } from '../../src/theme';
import { Card, Button } from '../../src/components/ui';
import { useRTL } from '../../src/hooks/useRTL';

export default function CartScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { items, cartTotal, cartCount, removeItem, updateQuantity } = useCartStore();

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={colors.muted.foreground} />
        <Text style={styles.emptyText}>{t('cart.empty')}</Text>
        <Text style={styles.emptySubtext}>{t('cart.empty_subtitle')}</Text>
        <Button
          title={t('cart.continue_shopping')}
          onPress={() => router.push('/(tabs)')}
          size="lg"
          style={styles.button}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.variantId}
        renderItem={({ item }) => (
          <Card style={styles.cartItem}>
            <View style={[styles.itemRow, isRTL && styles.rowReverse]}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, styles.placeholderImage]}>
                  <Ionicons name="image-outline" size={24} color={colors.muted.foreground} />
                </View>
              )}

              <View style={[styles.itemInfo, isRTL && styles.itemInfoRTL]}>
                <Text style={[styles.itemName, isRTL && styles.rtlText]} numberOfLines={2}>{item.name}</Text>
                <Text style={[styles.itemDetails, isRTL && styles.rtlText]}>
                  {item.color} • {item.size}
                </Text>
                <Text style={[styles.itemPrice, isRTL && styles.rtlText]}>€{item.price.toFixed(2)}</Text>
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
      <View style={styles.footer}>
        <View style={[styles.totalRow, isRTL && styles.rowReverse]}>
          <Text style={[styles.totalLabel, isRTL && styles.rtlText]}>
            {t('cart.total')} ({cartCount} {t('cart.item_count', { count: cartCount })})
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  emptyText: {
    fontSize: 24,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    marginTop: spacing[4],
    marginBottom: spacing[2],
  },
  emptySubtext: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    textAlign: 'center',
    marginBottom: spacing[8],
  },
  button: {
    width: '100%',
    maxWidth: 300,
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
  rowReverse: {
    flexDirection: 'row-reverse',
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
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
