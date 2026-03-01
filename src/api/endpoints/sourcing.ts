import { supabase } from '../supabase';
import { apiFetch } from '../client';
import * as FileSystem from 'expo-file-system';

export type BudgetRange =
  | 'no_budget'
  | 'under_100'
  | '100_200'
  | '200_500'
  | '500_1000'
  | 'over_1000';

export interface SourcingRequestData {
  customerName: string;
  customerPhone: string;
  customerCity: string;
  description?: string;
  productLink?: string;
  budgetRange?: BudgetRange;
  notes?: string;
  imageUrls: string[];
}

export interface SourcingRequestImage {
  id: string;
  imageUrl: string;
  displayOrder: number;
}

export interface SourcingRequest {
  id: string;
  requestNumber: string;
  customerName: string;
  customerCity: string;
  description?: string;
  productLink?: string;
  budgetRange?: string;
  notes?: string;
  status: string;
  salePrice?: number;
  saleCurrency: string;
  shippingEstimateDays?: number;
  images: SourcingRequestImage[];
  createdAt: string;
  updatedAt: string;
  quotedAt?: string;
}

/**
 * Upload a sourcing image to Supabase storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadSourcingImage(uri: string): Promise<string> {
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `sourcing/temp/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: 'base64',
  });

  const { data, error } = await supabase.storage
    .from('images')
    .upload(fileName, decode(base64), {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Submit a sourcing request via the server API.
 * Routes through /api/mobile/sourcing for server-side validation and rate limiting.
 */
export async function submitSourcingRequest(
  data: SourcingRequestData
): Promise<{ success: true; requestNumber: string } | { success: false; error: string }> {
  try {
    const result = await apiFetch<{ success: boolean; requestNumber?: string; error?: string }>(
      '/api/mobile/sourcing',
      { body: data },
    );

    if (result.success && result.requestNumber) {
      return { success: true, requestNumber: result.requestNumber };
    }

    return { success: false, error: result.error || 'Failed to submit request' };
  } catch (error: any) {
    console.error('Submit sourcing request error:', error);
    return { success: false, error: error?.message || 'Failed to submit request' };
  }
}

/**
 * Fetch the authenticated user's sourcing requests.
 */
export async function getSourcingRequests(): Promise<SourcingRequest[]> {
  const result = await apiFetch<{ success: boolean; requests: SourcingRequest[] }>(
    '/api/mobile/sourcing',
    { requireAuth: true },
  );

  if (!result.success) return [];
  return result.requests;
}

/** Decode base64 string to ArrayBuffer for Supabase upload */
function decode(base64: string): ArrayBuffer {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes: number[] = [];
  for (let i = 0; i < base64.length; i += 4) {
    const a = chars.indexOf(base64[i]);
    const b = chars.indexOf(base64[i + 1]);
    const c = chars.indexOf(base64[i + 2]);
    const d = chars.indexOf(base64[i + 3]);
    bytes.push((a << 2) | (b >> 4));
    if (base64[i + 2] !== '=') bytes.push(((b & 15) << 4) | (c >> 2));
    if (base64[i + 3] !== '=') bytes.push(((c & 3) << 6) | d);
  }
  return new Uint8Array(bytes).buffer;
}
