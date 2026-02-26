export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: OrderStatus;
  total_eur: number;
  shipping_fee: number;
  discount_amount?: number;
  deposit_amount?: number;
  items: OrderItem[];
  shipping_address: {
    fullName: string;
    phone: string;
    city: string;
    address?: string;
  };
  payment_method: 'cod';
  coupon_code?: string;
  status_history?: Record<string, string>;
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  product_name: string;
  color: string | null;
  size: string | null;
  quantity: number;
  price_eur: number;
  image_url?: string;
  is_concierge?: boolean;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}
