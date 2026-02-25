import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getOrders, getOrderById, subscribeToOrderUpdates } from '../api/endpoints/orders';
import { useAuthStore } from '../store/authStore';

export function useOrders() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToOrderUpdates(user.id, (updatedOrder) => {
      // Invalidate orders list to refetch
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      // Invalidate specific order if it's cached
      queryClient.invalidateQueries({ queryKey: ['order', updatedOrder.id] });
    });

    return unsubscribe;
  }, [user?.id, queryClient]);

  return query;
}

export function useOrder(orderId: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ['order', orderId],
    queryFn: () => getOrderById(orderId),
    enabled: !!user && !!orderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
