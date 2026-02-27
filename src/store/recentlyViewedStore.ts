import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RecentlyViewedItem {
  id: string;
  brand: string;
  model: string;
  price: number;
  image?: string;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  addProduct: (product: RecentlyViewedItem) => void;
  clear: () => void;
}

const MAX_ITEMS = 20;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],
      addProduct: (product) =>
        set((state) => {
          const filtered = state.items.filter((i) => i.id !== product.id);
          return { items: [product, ...filtered].slice(0, MAX_ITEMS) };
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'elite-recently-viewed',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
