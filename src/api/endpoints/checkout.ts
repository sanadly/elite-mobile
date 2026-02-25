import { supabase } from '../supabase';

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
  // Call backend API
  try {
    const response = await fetch(`${process.env.EXPO_PUBLIC_APP_URL}/api/coupons/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, subtotal }),
    });
    return await response.json();
  } catch (error) {
    return { valid: false, error: 'Network error' };
  }
}

export async function placeOrder(data: CheckoutData) {
  // Call backend API
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  const response = await fetch(`${process.env.EXPO_PUBLIC_APP_URL}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to place order');
  }

  return await response.json();
}

export async function getCities() {
  const { data, error } = await supabase
    .from('cities')
    .select('id, city_name, fee_local, currency')
    .order('city_name');
  
  if (error) throw error;
  return data || [];
}
