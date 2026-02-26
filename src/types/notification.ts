export type NotificationType = 'order_update' | 'promotion' | 'system';

export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  data?: {
    orderId?: string;
    productId?: string;
    [key: string]: unknown;
  };
  is_read: boolean;
  created_at: string;
}
