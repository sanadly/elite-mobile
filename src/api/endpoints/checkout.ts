import { supabase } from '../supabase';
import { apiFetch } from '../client';

export interface CheckoutData {
  fullName: string;
  phone: string;
  city: string;
  address?: string;
  items: Array<{
    variantId: string;
    quantity: number;
    price: number;
    name: string;
    image?: string;
    size: string | null;
    color: string | null;
    isConcierge?: boolean;
  }>;
  totalEur: number;
  customerId?: string;
  depositAmount?: number;
  couponCode?: string;
  shippingFee: number;
}

export interface CouponValidation {
  valid: boolean;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
    code: string;
  };
  error?: string;
}

export async function validateCoupon(code: string, subtotal: number): Promise<CouponValidation> {
  try {
    return await apiFetch<CouponValidation>('/api/mobile/coupons/validate', {
      body: { code, subtotal },
    });
  } catch (err) {
    console.warn('[Checkout] Coupon validation failed:', err);
    return { valid: false, error: 'Network error' };
  }
}

export async function placeOrder(data: CheckoutData) {
  const result = await apiFetch<{ success: boolean; orderNumber?: string; error?: string }>(
    '/api/mobile/orders',
    { requireAuth: true, body: data },
  );

  if (!result.success) {
    throw new Error(result.error || 'Failed to place order');
  }

  return result;
}

export interface City {
  id: string;
  city_name: string;
  fee_local: number;
  currency: string;
}

export async function getCities(): Promise<City[]> {
  const { data, error } = await supabase
    .from('courier_fees')
    .select('id, city_name, fee_local, currency')
    .order('city_name');

  if (error) throw error;
  return (data as City[]) || [];
}
