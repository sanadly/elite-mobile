import { supabase } from '../supabase';

export interface Order {
  id: string;
  order_number: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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

export async function getOrders() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      status,
      total_eur,
      shipping_fee,
      discount_amount,
      deposit_amount,
      payment_method,
      coupon_code,
      shipping_address
    `)
    .eq('customer_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderById(orderId: string) {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      status,
      total_eur,
      shipping_fee,
      discount_amount,
      deposit_amount,
      payment_method,
      coupon_code,
      shipping_address,
      status_history
    `)
    .eq('id', orderId)
    .eq('customer_id', session.user.id)
    .single();

  if (orderError) throw orderError;

  // Fetch order items
  const { data: items, error: itemsError } = await supabase
    .from('order_items')
    .select(`
      id,
      product_id,
      variant_id,
      product_name,
      color,
      size,
      quantity,
      price_eur,
      image_url,
      is_concierge
    `)
    .eq('order_id', orderId);

  if (itemsError) throw itemsError;

  return {
    ...order,
    items: items || []
  } as Order;
}

// Subscribe to order status updates
export function subscribeToOrderUpdates(
  userId: string,
  onUpdate: (order: any) => void
) {
  const channel = supabase
    .channel('order-updates')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: `customer_id=eq.${userId}`,
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
