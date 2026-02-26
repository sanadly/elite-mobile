import { supabase } from '../supabase';

const API_URL = process.env.EXPO_PUBLIC_APP_URL || '';

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
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    const response = await fetch(`${API_URL}/api/mobile/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ code, subtotal }),
    });
    return await response.json();
  } catch {
    return { valid: false, error: 'Network error' };
  }
}

export async function placeOrder(data: CheckoutData) {
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}/api/mobile/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to place order');
  }

  return result;
}

export async function getCities() {
  const { data, error } = await supabase
    .from('courier_fees')
    .select('id, city_name, fee_local, currency')
    .order('city_name');

  if (error) throw error;
  return data || [];
}
