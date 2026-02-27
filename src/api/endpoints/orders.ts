import { supabase, getAuthenticatedUserId } from '../supabase';
import { Order } from '../../types/order';

export type { Order, OrderItem, OrderStatusHistory, OrderType } from '../../types/order';

export async function getOrders() {
  const userId = await getAuthenticatedUserId();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      status,
      type,
      total_eur,
      shipping_fee,
      discount_amount,
      deposit_amount,
      payment_method,
      coupon_code,
      tracking_number,
      courier,
      shipping_address
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getOrderById(orderId: string) {
  const userId = await getAuthenticatedUserId();

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select(`
      id,
      order_number,
      created_at,
      status,
      type,
      total_eur,
      shipping_fee,
      discount_amount,
      deposit_amount,
      payment_method,
      coupon_code,
      tracking_number,
      courier,
      shipping_address,
      status_history
    `)
    .eq('id', orderId)
    .eq('customer_id', userId)
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
  onUpdate: (order: Record<string, unknown>) => void
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
