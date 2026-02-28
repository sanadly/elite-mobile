import { Product } from '../types/product';
import { apiFetch } from './client';

export const PRODUCTS_PER_PAGE = 20;

export interface FetchProductsParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  search?: string;
  sort?: string;
  immediateDelivery?: boolean;
  gender?: string;
  size?: string;
}

export async function fetchProducts(params: FetchProductsParams): Promise<Product[]> {
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) searchParams.set('page', String(params.page));
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
  if (params.category) searchParams.set('category', params.category);
  if (params.brand) searchParams.set('brand', params.brand);
  if (params.search) searchParams.set('search', params.search);
  if (params.sort && params.sort !== 'default') searchParams.set('sort', params.sort);
  if (params.immediateDelivery) searchParams.set('inStock', 'true');
  if (params.gender) searchParams.set('gender', params.gender);
  if (params.size) searchParams.set('size', params.size);

  const data = await apiFetch<{ products: Product[] }>(
    `/api/mobile/products?${searchParams.toString()}`
  );
  return data.products;
}

export function getProductsNextPageParam(lastPage: Product[], allPages: Product[][]) {
  return lastPage.length === PRODUCTS_PER_PAGE
    ? allPages.length * PRODUCTS_PER_PAGE
    : undefined;
}

export async function fetchSimilarProducts(productId: string, limit = 8): Promise<Product[]> {
  const data = await apiFetch<{ products: Product[] }>(
    `/api/mobile/products/similar?productId=${encodeURIComponent(productId)}&limit=${limit}`
  );
  return data.products;
}
