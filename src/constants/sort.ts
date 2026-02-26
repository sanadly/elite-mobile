import { SortOption } from '../store/filterStore';

export const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'default', label: 'filters.sort_default' },
  { key: 'best_sellers', label: 'filters.sort_best_sellers' },
  { key: 'newest', label: 'filters.sort_newest' },
  { key: 'price_asc', label: 'filters.sort_price_low' },
  { key: 'price_desc', label: 'filters.sort_price_high' },
];

export const SORT_LABELS: Record<SortOption, string> = Object.fromEntries(
  SORT_OPTIONS.map(({ key, label }) => [key, label])
) as Record<SortOption, string>;
