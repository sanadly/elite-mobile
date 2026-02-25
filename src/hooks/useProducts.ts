import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { supabase } from '../api/supabase';

const PRODUCTS_PER_PAGE = 20;

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
  cost?: number;
  is_active: boolean;
  variants: Array<{
    color: string;
    images: string[];
    sizes: Array<{
      size: string;
      stock: number;
      sku?: string;
    }>;
  }>;
}

export function useProducts() {
  return useInfiniteQuery({
    queryKey: ['products'],
    queryFn: async ({ pageParam = 0 }) => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(pageParam, pageParam + PRODUCTS_PER_PAGE - 1);

      if (error) throw error;
      return data as Product[];
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
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Product[];
    },
    enabled: !!category,
  });
}
