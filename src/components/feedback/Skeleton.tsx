import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors, spacing } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
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
});
