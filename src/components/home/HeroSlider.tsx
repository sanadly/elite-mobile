import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  useWindowDimensions,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { colors, spacing, radius } from '../../theme';
import { useRTL } from '../../hooks/useRTL';
import { API_BASE } from '../../api/config';

const HERO_BASE = `${API_BASE}/hero`;

const SLIDES = [
  {
    id: 'cartier',
    image: `${HERO_BASE}/cartier.png`,
    brand: 'Cartier',
  },
  {
    id: 'hublot',
    image: `${HERO_BASE}/hublot.png`,
    brand: 'Hublot',
  },
  {
    id: 'on',
    image: `${HERO_BASE}/on.png`,
    brand: 'On',
  },
];

const AUTO_ADVANCE_MS = 8000;

export function HeroSlider() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const isRTL = useRTL();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const autoAdvanceTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const slideWidth = width - spacing[4] * 2; // horizontal padding
  const slideHeight = slideWidth * (9 / 21); // 21:9 aspect ratio

  const slides = isRTL ? [...SLIDES].reverse() : SLIDES;

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToIndex = useCallback(
    (index: number) => {
      flatListRef.current?.scrollToIndex({ index, animated: true });
    },
    []
  );

  // Auto-advance
  useEffect(() => {
    autoAdvanceTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_ADVANCE_MS);

    return () => {
      if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);
    };
  }, [slides.length, scrollToIndex]);

  // Reset timer on manual swipe
  const resetAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current) clearInterval(autoAdvanceTimer.current);
    autoAdvanceTimer.current = setInterval(() => {
      setActiveIndex((prev) => {
        const next = (prev + 1) % slides.length;
        scrollToIndex(next);
        return next;
      });
    }, AUTO_ADVANCE_MS);
  }, [slides.length, scrollToIndex]);

  const handleSlidePress = (brand: string) => {
    router.push(`/products?brand=${encodeURIComponent(brand)}` as any);
  };

  const renderSlide = ({ item }: { item: (typeof slides)[number] }) => (
    <Pressable
      onPress={() => handleSlidePress(item.brand)}
      style={[styles.slide, { width: slideWidth, height: slideHeight }]}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.slideImage}
        contentFit="cover"
        transition={300}
        cachePolicy="memory-disk"
      />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideWidth}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: spacing[4] }}
        ItemSeparatorComponent={() => <View style={{ width: 0 }} />}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScrollBeginDrag={resetAutoAdvance}
        getItemLayout={(_, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
      />

      {/* Dot indicators */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <Pressable
            key={index}
            onPress={() => {
              scrollToIndex(index);
              setActiveIndex(index);
              resetAutoAdvance();
            }}
            hitSlop={8}
          >
            <View
              style={[
                styles.dot,
                activeIndex === index ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: spacing[3],
  },
  slide: {
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.muted.DEFAULT,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingTop: spacing[3],
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 32,
    backgroundColor: colors.primary.DEFAULT,
  },
  dotInactive: {
    width: 8,
    backgroundColor: colors.primary.DEFAULT + '50',
  },
});
