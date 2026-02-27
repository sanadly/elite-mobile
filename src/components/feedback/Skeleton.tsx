import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing, radius as themeRadius } from '../../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_CARD_WIDTH = (SCREEN_WIDTH - spacing[2] * 4) / 2;

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: object;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    return { opacity };
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[styles.shimmer, animatedStyle]} />
    </View>
  );
}

// Skeleton for Product Card
export function ProductCardSkeleton() {
  return (
    <View style={styles.productCard}>
      <Skeleton width="100%" height={200} borderRadius={8} />
      <View style={styles.productInfo}>
        <Skeleton width="60%" height={16} style={styles.spacing} />
        <Skeleton width="40%" height={14} style={styles.spacing} />
        <Skeleton width="30%" height={20} style={styles.spacing} />
      </View>
    </View>
  );
}

// Skeleton for Order Card
export function OrderCardSkeleton() {
  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Skeleton width="60%" height={18} style={styles.spacing} />
          <Skeleton width="40%" height={14} style={styles.spacing} />
        </View>
        <Skeleton width={80} height={24} borderRadius={12} />
      </View>
      <View style={styles.orderBody}>
        <Skeleton width="50%" height={14} style={styles.spacing} />
        <Skeleton width="30%" height={20} />
      </View>
    </View>
  );
}

// Skeleton for List (multiple items)
interface SkeletonListProps {
  count?: number;
  type: 'product' | 'order';
}

export function SkeletonList({ count = 3, type }: SkeletonListProps) {
  const Component = type === 'product' ? ProductCardSkeleton : OrderCardSkeleton;

  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, index) => (
        <Component key={index} />
      ))}
    </View>
  );
}

// Skeleton for Product Grid (2-column layout matching ProductCard)
export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.productGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.gridCard}>
          <Skeleton width={GRID_CARD_WIDTH} height={GRID_CARD_WIDTH} borderRadius={themeRadius.lg} />
          <View style={styles.productInfo}>
            <Skeleton width="80%" height={14} style={styles.spacing} />
            <Skeleton width="50%" height={12} style={styles.spacing} />
            <Skeleton width="35%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

// Full Product Detail page skeleton
export function ProductDetailSkeleton() {
  return (
    <View style={styles.detailContainer}>
      <Skeleton width={SCREEN_WIDTH} height={SCREEN_WIDTH / 0.85} borderRadius={0} />
      <View style={styles.detailInfo}>
        <Skeleton width={80} height={12} style={styles.spacing} />
        <Skeleton width="70%" height={22} style={styles.spacing} />
        <View style={styles.detailPriceRow}>
          <Skeleton width={100} height={22} />
          <Skeleton width={90} height={24} borderRadius={themeRadius.full} />
        </View>
        <Skeleton width="100%" height={14} style={{ marginTop: spacing[3] }} />
        <Skeleton width="80%" height={14} style={styles.spacing} />
        <View style={styles.detailDivider} />
        <Skeleton width={100} height={12} style={styles.spacing} />
        <View style={styles.detailOptionsRow}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} width={80} height={36} borderRadius={themeRadius.full} />
          ))}
        </View>
        <Skeleton width={80} height={12} style={{ marginTop: spacing[5] }} />
        <View style={[styles.detailOptionsRow, { marginTop: spacing[3] }]}>
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} width={56} height={44} borderRadius={themeRadius.md} />
          ))}
        </View>
      </View>
    </View>
  );
}

// Home screen skeleton (hero + search + categories + product grid)
export function HomeScreenSkeleton() {
  return (
    <View>
      <Skeleton width={SCREEN_WIDTH} height={SCREEN_WIDTH * 0.55} borderRadius={0} />
      <View style={styles.homeSearch}>
        <Skeleton width="100%" height={48} borderRadius={themeRadius.lg} />
      </View>
      <View style={styles.homeCategoryRow}>
        {[1, 2, 3].map(i => (
          <Skeleton key={i} width={120} height={120} borderRadius={themeRadius.lg} />
        ))}
      </View>
      <View style={styles.homeSectionHeader}>
        <Skeleton width={140} height={20} />
      </View>
      <ProductGridSkeleton count={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.muted.DEFAULT,
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  spacing: {
    marginBottom: spacing[2],
  },
  productCard: {
    marginBottom: spacing[4],
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing[3],
  },
  productInfo: {
    marginTop: spacing[3],
  },
  orderCard: {
    marginBottom: spacing[3],
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing[3],
  },
  orderBody: {
    paddingTop: spacing[3],
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  list: {
    padding: spacing[4],
  },
  // Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing[2],
  },
  gridCard: {
    width: GRID_CARD_WIDTH,
    margin: spacing[2],
  },
  // Product Detail
  detailContainer: {
    flex: 1,
  },
  detailInfo: {
    paddingHorizontal: spacing[5],
    paddingTop: spacing[5],
  },
  detailPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginTop: spacing[2],
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing[5],
  },
  detailOptionsRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginTop: spacing[2],
  },
  // Home Screen
  homeSearch: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[5],
  },
  homeCategoryRow: {
    flexDirection: 'row',
    gap: spacing[3],
    paddingHorizontal: spacing[4],
    paddingTop: spacing[5],
  },
  homeSectionHeader: {
    paddingHorizontal: spacing[4],
    paddingTop: spacing[8],
    paddingBottom: spacing[4],
  },
});
