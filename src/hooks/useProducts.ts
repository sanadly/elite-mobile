import { useInfiniteQuery, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { fetchProducts, fetchSimilarProducts, getProductsNextPageParam, PRODUCTS_PER_PAGE } from '../api/products';
import { STALE_TIME } from '../constants/query';
import { queryKeys } from '../api/queryKeys';
import type { Product } from '../types/product';

export type { Product } from '../types/product';

export function useProducts() {
  return useInfiniteQuery({
    queryKey: queryKeys.products.all,
    queryFn: async ({ pageParam = 0 }) => {
      return fetchProducts({ page: pageParam, limit: PRODUCTS_PER_PAGE });
    },
    getNextPageParam: getProductsNextPageParam,
    initialPageParam: 0,
  });
}

export function useProduct(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.products.detail(id),
    queryFn: async () => {
      const products = await fetchProducts({ limit: 200 });
      const product = products.find(p => p.id === id);
      if (!product) throw new Error('Product not found');
      return product;
    },
    enabled: !!id,
    staleTime: STALE_TIME.long,
    initialData: () => {
      // Reuse data from the infinite products cache if available (avoids re-fetching 200 products)
      const cached = queryClient.getQueryData<InfiniteData<Product[]>>(queryKeys.products.all);
      return cached?.pages.flatMap(p => p).find(p => p.id === id);
    },
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

export function useSimilarProducts(productId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.products.similar(productId || ''),
    queryFn: () => fetchSimilarProducts(productId!, 8),
    enabled: !!productId,
    staleTime: STALE_TIME.extended,
  });
}
