import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../api/client';
import { queryKeys } from '../api/queryKeys';
import type { Brand } from '../types/brand';

export type { Brand } from '../types/brand';

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands.all,
    queryFn: async () => {
      const data = await apiFetch<{ brands: Brand[] }>('/api/mobile/brands');
      return (data.brands || []).map((b) => b.name);
    },
  });
}

export function useBrand(brandName: string | undefined) {
  return useQuery({
    queryKey: queryKeys.brands.detail(brandName || ''),
    queryFn: async () => {
      if (!brandName) return null;
      const data = await apiFetch<{ brand: Brand }>(
        `/api/mobile/brands?name=${encodeURIComponent(brandName)}`
      );
      return data.brand || null;
    },
    enabled: !!brandName,
  });
}
