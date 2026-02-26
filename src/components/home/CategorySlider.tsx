import React from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { colors, fonts, spacing, radius, commonStyles } from '../../theme';
import { useRTL } from '../../hooks/useRTL';
import { CATEGORIES, Category } from '../../constants/categories';
import { API_BASE } from '../../api/config';

const CATEGORY_IMAGE_BASE = `${API_BASE}/assets/categories`;

interface CategoryItem {
  id: Category;
  imageUrl: string;
}

const CATEGORY_DATA: CategoryItem[] = CATEGORIES.map((cat) => ({
  id: cat,
  imageUrl: `${CATEGORY_IMAGE_BASE}/${cat}.png`,
}));

const CARD_SIZE = 120;

export function CategorySlider() {
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useRTL();

  const handleCategoryPress = (category: Category) => {
    router.push(`/products?category=${category}` as any);
  };

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <Pressable
      onPress={() => handleCategoryPress(item.id)}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.cardImage}
        contentFit="cover"
        transition={200}
        cachePolicy="memory-disk"
      />
      <View style={styles.cardOverlay} />
      <View style={styles.cardLabelContainer}>
        <Text style={styles.cardLabel}>{t(`home.categories.${item.id}`)}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, isRTL && commonStyles.rtlText]}>
        {t('home.categories.title')}
      </Text>
      <FlatList
        data={CATEGORY_DATA}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        horizontal
        inverted={isRTL}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ width: spacing[3] }} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing[8],
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.foreground,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
    letterSpacing: -0.3,
  },
  listContent: {
    paddingHorizontal: spacing[4],
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.muted.DEFAULT,
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay.dark35,
  },
  cardLabelContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing[2],
    paddingBottom: spacing[3],
  },
  cardLabel: {
    fontSize: 13,
    fontFamily: fonts.semibold,
    color: '#ffffff',
    textAlign: 'center',
  },
});
