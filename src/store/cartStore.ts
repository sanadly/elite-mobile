import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

export interface CartItem {
  variantId: string;
  productId: string;
  name: string;
  price: number;
  image?: string;
  size: string | null;
  color: string | null;
  quantity: number;
  maxStock: number;
  isConcierge?: boolean;
}

/** Concierge items have unlimited stock (no cap on quantity). */
const isConciergeItem = (item: Pick<CartItem, 'isConcierge' | 'maxStock'>) =>
  item.isConcierge || item.maxStock === -1;

interface AddItemResult {
  success: boolean;
  reason?: 'added' | 'incremented' | 'max_stock_reached';
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => AddItemResult;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find((i) => i.variantId === newItem.variantId);

        if (existingItem) {
          if (!isConciergeItem(existingItem) && existingItem.quantity >= existingItem.maxStock) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            return { success: false, reason: 'max_stock_reached' };
          }

          set({
            items: items.map((i) =>
              i.variantId === newItem.variantId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          });
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          return { success: true, reason: 'incremented' };
        }

        if (!isConciergeItem(newItem) && newItem.maxStock <= 0) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return { success: false, reason: 'max_stock_reached' };
        }

        set({ items: [...items, { ...newItem, quantity: 1 }] });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        return { success: true, reason: 'added' };
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      },

      updateQuantity: (variantId, quantity) => {
        set({
          items: get()
            .items.map((i) => {
              if (i.variantId === variantId) {
                const newQty = isConciergeItem(i)
                  ? Math.max(0, quantity)
                  : Math.max(0, Math.min(quantity, i.maxStock));
                return { ...i, quantity: newQty };
              }
              return i;
            })
            .filter((i) => i.quantity > 0),
        });
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'elite-cart',
      version: 2,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items }),
      migrate: (persistedState, version) => {
        const state = persistedState as { items?: CartItem[] } | null;
        if (version < 2) {
          return { items: state?.items || [] };
        }
        return state as { items: CartItem[] };
      },
    }
  )
);

export const selectCartCount = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotal = (state: CartState) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
