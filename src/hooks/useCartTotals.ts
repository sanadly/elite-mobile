import { useCartStore, selectCartCount, selectCartTotal } from '../store/cartStore';

/**
 * Returns memoized cart count and total via Zustand selectors.
 * Replaces repeated `useMemo(() => items.reduce(...), [items])` in cart/checkout.
 */
export function useCartTotals() {
  const count = useCartStore(selectCartCount);
  const total = useCartStore(selectCartTotal);
  return { count, total };
}
