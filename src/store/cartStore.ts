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
  cartCount: number;
  cartTotal: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const items = get().items;
        const existingItem = items.find((i) => i.variantId === newItem.variantId);

        if (existingItem) {
          const isConcierge = existingItem.isConcierge || existingItem.maxStock === -1;
          if (!isConcierge && existingItem.quantity >= existingItem.maxStock) {
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

        const isConcierge = newItem.isConcierge || newItem.maxStock === -1;
        if (!isConcierge && newItem.maxStock <= 0) {
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
                const isConcierge = i.isConcierge || i.maxStock === -1;
                const newQty = isConcierge
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

      get cartCount() {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      get cartTotal() {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'elite-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
