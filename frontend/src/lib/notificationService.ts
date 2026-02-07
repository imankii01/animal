/**
 * Notification Service
 * Handles WhatsApp and SMS notifications from the frontend
 */

import { API_BASE_URL } from './api';

interface NotificationPayload {
  phoneNumber: string;
  message: string;
  farmerId?: string;
  type?: 'whatsapp' | 'sms';
}

interface BulkNotificationPayload {
  recipients: Array<{
    phoneNumber: string;
    farmerId?: string;
  }>;
  message: string;
  type?: 'whatsapp' | 'sms';
}

/**
 * Send WhatsApp notification
 */
export async function sendWhatsAppNotification(
  phoneNumber: string,
  message: string,
  farmerId?: string
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        message,
        farmerId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send WhatsApp notification: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    throw error;
  }
}

/**
 * Send SMS notification
 */
export async function sendSmsNotification(
  phoneNumber: string,
  message: string,
  farmerId?: string
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        message,
        farmerId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send SMS notification: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    throw error;
  }
}

/**
 * Send bulk notifications
 */
export async function sendBulkNotifications(
  payload: BulkNotificationPayload
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Failed to send bulk notifications: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    throw error;
  }
}

/**
 * Send test notification (for development)
 */
export async function sendTestNotification(
  phoneNumber: string,
  type: 'whatsapp' | 'sms' = 'whatsapp'
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        type,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send test notification: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error sending test notification:', error);
    throw error;
  }
}

/**
 * Get notification service status
 */
export async function getNotificationStatus(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/notifications/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get notification status: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error getting notification status:', error);
    throw error;
  }
}

/**
 * Create a notification scheduler hook
 * Allows scheduling notifications for specific times
 */
export class NotificationScheduler {
  private scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Schedule a notification to be sent at a specific time
   */
  public scheduleNotification(
    id: string,
    delayMs: number,
    notification: NotificationPayload
  ): void {
    // Cancel existing scheduled notification with same ID
    if (this.scheduledNotifications.has(id)) {
      const existingTimeout = this.scheduledNotifications.get(id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }
    }

    // Schedule new notification
    const timeout = setTimeout(async () => {
      try {
        if (notification.type === 'sms') {
          await sendSmsNotification(
            notification.phoneNumber,
            notification.message,
            notification.farmerId
          );
        } else {
          await sendWhatsAppNotification(
            notification.phoneNumber,
            notification.message,
            notification.farmerId
          );
        }

        console.log(`✓ Scheduled notification ${id} sent`);
      } catch (error) {
        console.error(`Error sending scheduled notification ${id}:`, error);
      } finally {
        this.scheduledNotifications.delete(id);
      }
    }, delayMs);

    this.scheduledNotifications.set(id, timeout);
  }

  /**
   * Cancel a scheduled notification
   */
  public cancelNotification(id: string): boolean {
    const timeout = this.scheduledNotifications.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledNotifications.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Get all scheduled notifications
   */
  public getScheduledNotifications(): string[] {
    return Array.from(this.scheduledNotifications.keys());
  }

  /**
   * Clear all scheduled notifications
   */
  public clearAllNotifications(): void {
    this.scheduledNotifications.forEach((timeout) => {
      clearTimeout(timeout);
    });
    this.scheduledNotifications.clear();
  }
}

export default {
  sendWhatsAppNotification,
  sendSmsNotification,
  sendBulkNotifications,
  sendTestNotification,
  getNotificationStatus,
  NotificationScheduler,
};
