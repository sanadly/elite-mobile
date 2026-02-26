import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, ViewToken } from 'react-native';
import { Image } from 'expo-image';
import { colors, typography, fonts, spacing } from '../../theme';
import { BackButton } from '../ui';

const { width } = Dimensions.get('window');

interface ImageGalleryProps {
  images: string[];
  selectedVariant: number;
  isRTL: boolean;
  noImageLabel: string;
}

export function ImageGallery({ images, selectedVariant, isRTL, noImageLabel }: ImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  return (
    <View style={styles.container}>
      {images.length > 0 ? (
        <>
          <FlatList
            key={selectedVariant}
            ref={listRef}
            data={images}
            extraData={selectedVariant}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            keyExtractor={(_, i) => `${selectedVariant}-${i}`}
            renderItem={({ item }) => (
              <View style={styles.imageSlide}>
                <Image
                  source={{ uri: item }}
                  style={styles.productImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
              </View>
            )}
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
          {images.length > 1 && (
            <View style={styles.dotsContainer}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    activeIndex === i ? styles.dotActive : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          )}
        </>
      ) : (
        <View style={[styles.imageSlide, styles.placeholderImage]}>
          <Text style={styles.placeholderText}>{noImageLabel}</Text>
        </View>
      )}

      <BackButton
        variant="floating"
        style={[styles.backButton, isRTL && styles.backButtonRTL]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: colors.muted.DEFAULT,
  },
  imageSlide: {
    width,
    aspectRatio: 0.85,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.secondary.DEFAULT + '80',
  },
  placeholderText: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
  },
  dotsContainer: {
    position: 'absolute',
    bottom: spacing[4],
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary.DEFAULT,
  },
  dotInactive: {
    width: 6,
    backgroundColor: colors.overlay.light60,
  },
  backButton: {
    position: 'absolute',
    top: spacing[12] + spacing[2],
    left: spacing[4],
  },
  backButtonRTL: {
    left: undefined,
    right: spacing[4],
  },
});
