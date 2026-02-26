import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { fetchProducts, PRODUCTS_PER_PAGE } from '../api/products';
import { queryKeys } from '../api/queryKeys';

export type { Product } from '../types/product';

export function useProducts() {
  return useInfiniteQuery({
    queryKey: queryKeys.products.all,
    queryFn: async ({ pageParam = 0 }) => {
      return fetchProducts({ page: pageParam, limit: PRODUCTS_PER_PAGE });
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === PRODUCTS_PER_PAGE
        ? pages.length * PRODUCTS_PER_PAGE
        : undefined;
    },
    initialPageParam: 0,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      // Use the API which already merges all color variants by brand+model
      const products = await fetchProducts({ limit: 200 });
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    },
    enabled: !!id,
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: queryKeys.products.byCategory(category),
    queryFn: async () => {
      return fetchProducts({ category });
    },
    enabled: !!category,
  });
}

export function useProductsByBrand(brand: string) {
  return useQuery({
    queryKey: queryKeys.products.byBrand(brand),
    queryFn: async () => {
      return fetchProducts({ brand });
    },
    enabled: !!brand,
  });
}
