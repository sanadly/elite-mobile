export const CATEGORIES = [
  'watches',
  'bags',
  'shoes',
  'clothes',
  'accessories',
  'parfums',
  'kids',
  'cosmetics',
  'other',
] as const;

export type Category = (typeof CATEGORIES)[number];
