import { apiRequest } from './apiClient';

export interface NotificationItem {
  id: string;
  type: 'SYSTEM' | 'SECURITY' | 'INVESTMENT' | 'PAYOUT' | 'WITHDRAWAL' | 'REFERRAL' | 'ADMIN';
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  notifications: NotificationItem[];
  totalCount: number;
  unreadCount: number;
}

export class NotificationService {
  static async getNotifications(unreadOnly = false): Promise<NotificationListResponse> {
    return apiRequest<NotificationListResponse>(
      `/notifications${unreadOnly ? '?unreadOnly=true' : ''}`,
      { method: 'GET' }
    );
  }

  static async getUnreadCount(): Promise<number> {
    const res = await apiRequest<{ unreadCount: number }>('/notifications/unread-count', {
      method: 'GET',
    });
    return res.unreadCount;
  }

  static async markAsRead(id: string): Promise<void> {
    await apiRequest(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  static async markAllAsRead(): Promise<void> {
    await apiRequest('/notifications/read-all', {
      method: 'PATCH',
    });
  }
}
