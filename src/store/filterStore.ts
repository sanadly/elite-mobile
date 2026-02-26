import { create } from 'zustand';

export type SortOption = 'default' | 'best_sellers' | 'price_asc' | 'price_desc' | 'newest';

export type Gender = 'men' | 'women' | 'unisex';

interface FilterState {
  search: string;
  category: string;
  sortBy: SortOption;
  immediateDelivery: boolean;
  brand: string;
  gender: string;
  size: string;

  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setSortBy: (sort: SortOption) => void;
  toggleImmediateDelivery: () => void;
  setBrand: (brand: string) => void;
  setGender: (gender: string) => void;
  setSize: (size: string) => void;
  clearAll: () => void;
  activeFilterCount: () => number;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  search: '',
  category: '',
  sortBy: 'default',
  immediateDelivery: false,
  brand: '',
  gender: '',
  size: '',

  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setSortBy: (sortBy) => set({ sortBy }),
  toggleImmediateDelivery: () =>
    set((state) => ({ immediateDelivery: !state.immediateDelivery })),
  setBrand: (brand) => set({ brand }),
  setGender: (gender) => set({ gender }),
  setSize: (size) => set({ size }),
  clearAll: () =>
    set({
      search: '',
      category: '',
      sortBy: 'default',
      immediateDelivery: false,
      brand: '',
      gender: '',
      size: '',
    }),
  activeFilterCount: () => {
    const state = get();
    let count = 0;
    if (state.category) count++;
    if (state.sortBy !== 'default') count++;
    if (state.immediateDelivery) count++;
    if (state.brand) count++;
    if (state.gender) count++;
    if (state.size) count++;
    return count;
  },
}));
