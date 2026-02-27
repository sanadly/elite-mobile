import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useRecentlyViewedStore } from '../../store/recentlyViewedStore';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../theme';
import { useRTL } from '../../hooks/useRTL';

const CARD_WIDTH = 140;

export function RecentlyViewed() {
  const { items } = useRecentlyViewedStore();
  const { t } = useTranslation();
  const router = useRouter();
  const isRTL = useRTL();

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.title, isRTL && commonStyles.rtlText]}>
        {t('home.recently_viewed')}
      </Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        inverted={isRTL}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            onPress={() => router.push(`/product/${item.id}` as any)}
          >
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.image}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.image, styles.placeholder]} />
            )}
            <Text style={[styles.name, isRTL && commonStyles.rtlText]} numberOfLines={1}>
              {item.brand} {item.model}
            </Text>
            <Text style={[styles.price, isRTL && commonStyles.rtlText]}>
              {'\u20AC'}{item.price.toFixed(2)}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing[6],
  },
  title: {
    fontSize: 20,
    fontFamily: fonts.bold,
    color: colors.foreground,
    letterSpacing: -0.3,
    paddingHorizontal: spacing[4],
    marginBottom: spacing[4],
  },
  list: {
    paddingHorizontal: spacing[4],
    gap: spacing[3],
  },
  card: {
    width: CARD_WIDTH,
  },
  pressed: {
    opacity: 0.8,
  },
  image: {
    width: CARD_WIDTH,
    height: CARD_WIDTH,
    borderRadius: radius.lg,
    backgroundColor: colors.muted.DEFAULT,
  },
  placeholder: {
    backgroundColor: colors.secondary.DEFAULT + '80',
  },
  name: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.semibold,
    color: colors.foreground,
    textTransform: 'uppercase',
    marginTop: spacing[2],
  },
  price: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.bold,
    color: colors.foreground,
    marginTop: spacing[1],
  },
});
