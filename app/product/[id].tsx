import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, Dimensions, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useProduct } from '../../src/hooks/useProducts';
import { useCartStore } from '../../src/store/cartStore';
import { colors, typography, fonts, spacing, radius } from '../../src/theme';
import { Button, Card } from '../../src/components/ui';
import { useRTL } from '../../src/hooks/useRTL';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const isRTL = useRTL();
  const { data: product, isLoading } = useProduct(id);
  const { addItem } = useCartStore();
  const router = useRouter();
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  if (isLoading) {
    return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary.DEFAULT} /></View>;
  }
  if (!product) {
    return <View style={styles.loading}><Text>{t('errors.not_found')}</Text></View>;
  }

  const variant = product.variants?.[selectedVariant];
  const availableSizes = variant?.sizes?.filter(s => s.stock > 0) || [];
  const selectedSizeData = variant?.sizes?.find(s => s.size === selectedSize);

  const handleAddToCart = () => {
    if (!selectedSize || !variant || !selectedSizeData) return;
    const result = addItem({
      variantId: `${product.id}-${variant.color}-${selectedSize}`,
      productId: product.id,
      name: product.name?.en || product.model,
      price: product.price,
      image: variant.images?.[0],
      size: selectedSize,
      color: variant.color,
      maxStock: selectedSizeData.stock,
    });
    if (result.success) router.push('/(tabs)/cart');
  };

  return (
    <ScrollView style={styles.container}>
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {variant?.images?.map((img, i) => (
          <Image key={i} source={{ uri: img }} style={styles.image} resizeMode="cover" />
        ))}
      </ScrollView>

      <View style={styles.content}>
        <Text style={[styles.brand, isRTL && styles.rtlText]}>{product.brand}</Text>
        <Text style={[styles.name, isRTL && styles.rtlText]}>{product.name?.en || product.model}</Text>
        <Text style={[styles.price, isRTL && styles.rtlText]}>€{product.price.toFixed(2)}</Text>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('products.select_color')}</Text>
          <ScrollView horizontal>
            {product.variants?.map((v, i) => (
              <Pressable
                key={i}
                onPress={() => { setSelectedVariant(i); setSelectedSize(null); }}
                style={[styles.option, selectedVariant === i && styles.selected]}
              >
                <Text>{v.color}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Card>

        <Card style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('products.select_size')}</Text>
          <View style={styles.sizeGrid}>
            {availableSizes.map(s => (
              <Pressable
                key={s.size}
                onPress={() => setSelectedSize(s.size)}
                style={[styles.option, selectedSize === s.size && styles.selected]}
              >
                <Text>{s.size}</Text>
              </Pressable>
            ))}
          </View>
        </Card>

        <Button title={t('products.add_to_cart')} onPress={handleAddToCart} disabled={!selectedSize} size="lg" style={styles.addButton} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width, height: width },
  content: { padding: spacing[4] },
  brand: { fontSize: typography.fontSize.sm, color: colors.primary.DEFAULT, textTransform: 'uppercase', fontFamily: fonts.regular },
  name: { fontSize: typography.fontSize['2xl'], fontFamily: fonts.bold, marginTop: spacing[1] },
  price: { fontSize: typography.fontSize['3xl'], fontFamily: fonts.bold, color: colors.primary.DEFAULT, marginTop: spacing[2] },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  section: { marginTop: spacing[4] },
  sectionTitle: { fontSize: typography.fontSize.base, fontFamily: fonts.semibold, marginBottom: spacing[2] },
  sizeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing[2] },
  option: { paddingHorizontal: spacing[4], paddingVertical: spacing[2], borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, marginRight: spacing[2] },
  selected: { borderColor: colors.primary.DEFAULT, backgroundColor: colors.primary.DEFAULT },
  addButton: { marginTop: spacing[6], marginBottom: spacing[8] },
});
