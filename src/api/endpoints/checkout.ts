import { supabase } from '../supabase';
import { API_BASE, getAuthHeaders, getRequiredAuthHeaders } from '../config';

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
    const authHeaders = await getAuthHeaders();

    const response = await fetch(`${API_BASE}/api/mobile/coupons/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({ code, subtotal }),
    });
    return await response.json();
  } catch (err) {
    console.warn('[Checkout] Coupon validation failed:', err);
    return { valid: false, error: 'Network error' };
  }
}

export async function placeOrder(data: CheckoutData) {
  const authHeaders = await getRequiredAuthHeaders();

  const response = await fetch(`${API_BASE}/api/mobile/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.error || 'Failed to place order');
  }

  return result;
}


