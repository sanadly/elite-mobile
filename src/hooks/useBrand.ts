import { useQuery } from '@tanstack/react-query';
import { API_BASE } from '../api/config';
import { queryKeys } from '../api/queryKeys';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  description_en: string | null;
  description_ar: string | null;
}

export function useBrands() {
  return useQuery({
    queryKey: queryKeys.brands.all,
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/mobile/brands`);
      if (!res.ok) throw new Error('Failed to fetch brands');

      const data = await res.json();
      return ((data.brands as Brand[]) || []).map((b) => b.name);
    },
  });
}

export function useBrand(brandName: string | undefined) {
  return useQuery({
    queryKey: queryKeys.brands.detail(brandName || ''),
    queryFn: async () => {
      if (!brandName) return null;

      const res = await fetch(
        `${API_BASE}/api/mobile/brands?name=${encodeURIComponent(brandName)}`
      );
      if (!res.ok) throw new Error('Failed to fetch brand');

      const data = await res.json();
      return (data.brand as Brand) || null;
    },
    enabled: !!brandName,
  });
}
