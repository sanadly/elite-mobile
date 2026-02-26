export const queryKeys = {
  products: {
    all: ['products'] as const,
    list: () => [...queryKeys.products.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
    byCategory: (category: string) => [...queryKeys.products.all, 'category', category] as const,
    byBrand: (brand: string) => [...queryKeys.products.all, 'brand', brand] as const,
    filtered: (filters: Record<string, unknown>) => ['filtered-products', ...Object.values(filters)] as const,
  },
  brands: {
    all: ['brands'] as const,
    detail: (name: string) => ['brand', name] as const,
  },
  orders: {
    all: ['orders'] as const,
    detail: (id: string) => ['orders', id] as const,
  },
} as const;
