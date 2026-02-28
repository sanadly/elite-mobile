import { supabase } from '../supabase';
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
 * Submit a sourcing request to the database.
 */
export async function submitSourcingRequest(
  data: SourcingRequestData
): Promise<{ success: true; requestNumber: string } | { success: false; error: string }> {
  try {
    // Generate request number via DB function
    const { data: requestNumber, error: seqError } = await supabase
      .rpc('generate_sourcing_request_number' as any);

    if (seqError) throw seqError;

    // Insert the request
    const { data: request, error: insertError } = await (supabase as any)
      .from('sourcing_requests')
      .insert({
        request_number: requestNumber,
        customer_name: data.customerName.trim(),
        customer_phone: `+218${data.customerPhone}`,
        customer_city: data.customerCity.trim(),
        description: data.description?.trim() || null,
        product_link: data.productLink?.trim() || null,
        budget_range: data.budgetRange || null,
        notes: data.notes?.trim() || null,
        status: 'new',
      })
      .select('id, request_number')
      .single();

    if (insertError) throw insertError;

    // Insert images
    const imageInserts = data.imageUrls.map((url, index) => ({
      request_id: request.id,
      image_url: url,
      display_order: index,
    }));

    const { error: imgError } = await (supabase as any)
      .from('sourcing_request_images')
      .insert(imageInserts);

    if (imgError) throw imgError;

    return { success: true, requestNumber: request.request_number };
  } catch (error: any) {
    console.error('Submit sourcing request error:', error);
    return { success: false, error: error?.message || 'Failed to submit request' };
  }
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
