import { useInfiniteQuery } from '@tanstack/react-query';
import { useFilterStore } from '../store/filterStore';
import { useEffect, useState } from 'react';
import { fetchProducts, PRODUCTS_PER_PAGE } from '../api/products';
import { queryKeys } from '../api/queryKeys';

export function useFilteredProducts() {
  const { search, category, sortBy, immediateDelivery, brand, gender, size } =
    useFilterStore();

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  return useInfiniteQuery({
    queryKey: queryKeys.products.filtered({
      search: debouncedSearch,
      category,
      sortBy,
      immediateDelivery,
      brand,
      gender,
      size,
    }),
    queryFn: async ({ pageParam = 0 }) => {
      return fetchProducts({
        page: pageParam,
        limit: PRODUCTS_PER_PAGE,
        category,
        brand,
        search: debouncedSearch,
        sort: sortBy,
        immediateDelivery,
        gender,
        size,
      });
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === PRODUCTS_PER_PAGE
        ? pages.length * PRODUCTS_PER_PAGE
        : undefined;
    },
    initialPageParam: 0,
  });
}
