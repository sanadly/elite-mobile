import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '../api/supabase';

const PRODUCTS_PER_PAGE = 20;
const API_BASE = process.env.EXPO_PUBLIC_APP_URL || '';

export interface Product {
  id: string;
  brand: string;
  model: string;
  name: {
    en: string;
    ar: string;
  };
  description?: {
    en: string;
    ar: string;
  };
  category: string;
  price: number;
  images?: string[];
  is_active: boolean;
  show_out_of_stock?: boolean;
  variants: Array<{
    color: string;
    sizeSystem?: string;
    sizes: Array<{
      size: string;
      price?: number;
      sku?: string;
    }>;
    images?: string[];
  }>;
  hasStock?: boolean;
  stockRemaining?: number;
  availableColors?: string[];
}

async function fetchProductsFromAPI(params: { page?: number; limit?: number; category?: string }): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);

  const res = await fetch(`${API_BASE}/api/mobile/products?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');

  const data = await res.json();
  return data.products as Product[];
}

export function useProducts() {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: async ({ pageParam = 0 }) => {
      return fetchProductsFromAPI({ page: pageParam, limit: PRODUCTS_PER_PAGE });
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
    queryKey: ['product', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Product;
    },
    enabled: !!id,
  });
}

export function useProductsByCategory(category: string) {
  return useQuery({
    queryKey: ['products', 'category', category],
    queryFn: async () => {
      return fetchProductsFromAPI({ category });
    },
    enabled: !!category,
  });
}
