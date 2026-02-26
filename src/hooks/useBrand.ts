import { useQuery } from '@tanstack/react-query';
import { supabase } from '../api/supabase';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  description_en: string | null;
  description_ar: string | null;
  website: string | null;
}

export function useBrand(brandName: string | undefined) {
  return useQuery({
    queryKey: ['brand', brandName],
    queryFn: async () => {
      if (!brandName) return null;

      const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug, logo_url, description, description_en, description_ar, website')
        .ilike('name', brandName)
        .maybeSingle();

      if (error) throw error;
      return data as Brand | null;
    },
    enabled: !!brandName,
  });
}
