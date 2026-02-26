import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications,
} from '../api/endpoints/notifications';
import { useAuthStore } from '../store/authStore';
import { queryKeys } from '../api/queryKeys';

/** Invalidate both notification list and unread count caches. */
function invalidateNotifications(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount });
}

export function useNotifications() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.notifications.all,
    queryFn: getNotifications,
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });

  // Subscribe to real-time new notifications
  useEffect(() => {
    if (!user?.id) return;

    const unsubscribe = subscribeToNotifications(user.id, () => {
      invalidateNotifications(queryClient);
    });

    return unsubscribe;
  }, [user?.id, queryClient]);

  return query;
}

export function useUnreadCount() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: getUnreadCount,
    enabled: !!user,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => invalidateNotifications(queryClient),
  });
}
