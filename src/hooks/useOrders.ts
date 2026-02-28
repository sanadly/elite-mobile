import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getOrders, getOrderById, subscribeToOrderUpdates } from '../api/endpoints/orders';
import { useAuthStore } from '../store/authStore';
import { queryKeys } from '../api/queryKeys';
import { STALE_TIME } from '../constants/query';

export function useOrders() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.orders.all,
    queryFn: getOrders,
    enabled: !!user,
    staleTime: STALE_TIME.long,
  });

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToOrderUpdates(user.id, (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(updatedOrder.id) });
    });

    return unsubscribe;
  }, [user?.id, queryClient]);

  return query;
}

export function useOrder(orderId: string) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.orders.detail(orderId),
    queryFn: () => getOrderById(orderId),
    enabled: !!user && !!orderId,
    staleTime: STALE_TIME.long,
  });
}
