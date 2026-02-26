import { supabase, getAuthenticatedUserId, getOptionalUserId } from '../supabase';
import type { AppNotification } from '../../types/notification';

export async function getNotifications(): Promise<AppNotification[]> {
  const userId = await getOptionalUserId();
  if (!userId) return [];

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return (data as AppNotification[]) || [];
}

export async function getUnreadCount(): Promise<number> {
  const userId = await getOptionalUserId();
  if (!userId) return 0;

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) return 0;
  return count || 0;
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);

  if (error) throw error;
}

export async function markAllAsRead(): Promise<void> {
  const userId = await getOptionalUserId();
  if (!userId) return;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function subscribeToNotifications(
  userId: string,
  onNew: (notification: AppNotification) => void
): () => void {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        onNew(payload.new as AppNotification);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
