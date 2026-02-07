import { useCallback, useEffect, useRef } from 'react';
import { NotificationScheduler } from '@/lib/notificationService';
import type { NotificationScheduler as NotificationSchedulerType } from '@/lib/notificationService';

interface ScheduledNotification {
  id: string;
  phoneNumber: string;
  message: string;
  scheduledTime: Date;
  type: 'whatsapp' | 'sms';
  farmerId?: string;
}

/**
 * Custom hook for scheduling notifications
 * Handles scheduling, canceling, and managing notification schedules
 */
export const useNotificationScheduler = () => {
  const schedulerRef = useRef<NotificationSchedulerType | null>(null);
  const scheduledListRef = useRef<Map<string, ScheduledNotification>>(new Map());

  // Initialize scheduler on mount
  useEffect(() => {
    schedulerRef.current = new NotificationScheduler();

    return () => {
      // Cleanup on unmount
      if (schedulerRef.current) {
        schedulerRef.current.clearAllNotifications();
      }
    };
  }, []);

  /**
   * Schedule a notification for a specific time
   */
  const scheduleNotification = useCallback(
    (
      id: string,
      phoneNumber: string,
      message: string,
      scheduledTime: Date,
      type: 'whatsapp' | 'sms' = 'whatsapp',
      farmerId?: string
    ): void => {
      if (!schedulerRef.current) return;

      const now = new Date();
      const delayMs = scheduledTime.getTime() - now.getTime();

      if (delayMs < 0) {
        console.warn(`[useNotificationScheduler] Scheduled time is in the past: ${scheduledTime}`);
        return;
      }

      schedulerRef.current.scheduleNotification(id, delayMs, {
        phoneNumber,
        message,
        type,
        farmerId,
      });

      // Track in local state
      scheduledListRef.current.set(id, {
        id,
        phoneNumber,
        message,
        scheduledTime,
        type,
        farmerId,
      });

      console.log(
        `[useNotificationScheduler] Scheduled ${type} notification for ${scheduledTime.toISOString()}`
      );
    },
    []
  );

  /**
   * Schedule a notification for a specific time of day (daily)
   */
  const scheduleDaily = useCallback(
    (
      id: string,
      phoneNumber: string,
      message: string,
      hour: number,
      minute: number = 0,
      type: 'whatsapp' | 'sms' = 'whatsapp',
      farmerId?: string
    ): void => {
      if (!schedulerRef.current) return;

      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      // If time has already passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      scheduleNotification(id, phoneNumber, message, scheduledTime, type, farmerId);
    },
    [scheduleNotification]
  );

  /**
   * Schedule a notification for a specific time of day (weekly)
   */
  const scheduleWeekly = useCallback(
    (
      id: string,
      phoneNumber: string,
      message: string,
      dayOfWeek: number, // 0 = Sunday, 1 = Monday, etc.
      hour: number,
      minute: number = 0,
      type: 'whatsapp' | 'sms' = 'whatsapp',
      farmerId?: string
    ): void => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(hour, minute, 0, 0);

      // Calculate days until target day of week
      const currentDay = now.getDay();
      let daysUntilTarget = dayOfWeek - currentDay;

      if (daysUntilTarget < 0 || (daysUntilTarget === 0 && scheduledTime <= now)) {
        daysUntilTarget += 7;
      }

      scheduledTime.setDate(scheduledTime.getDate() + daysUntilTarget);

      scheduleNotification(id, phoneNumber, message, scheduledTime, type, farmerId);
    },
    [scheduleNotification]
  );

  /**
   * Cancel a scheduled notification
   */
  const cancelNotification = useCallback((id: string): boolean => {
    if (!schedulerRef.current) return false;

    const success = schedulerRef.current.cancelNotification(id);
    if (success) {
      scheduledListRef.current.delete(id);
      console.log(`[useNotificationScheduler] Cancelled notification: ${id}`);
    }

    return success;
  }, []);

  /**
   * Get all scheduled notifications
   */
  const getScheduledNotifications = useCallback((): ScheduledNotification[] => {
    return Array.from(scheduledListRef.current.values());
  }, []);

  /**
   * Get a specific scheduled notification
   */
  const getScheduledNotification = useCallback(
    (id: string): ScheduledNotification | undefined => {
      return scheduledListRef.current.get(id);
    },
    []
  );

  /**
   * Check if a notification is scheduled
   */
  const isScheduled = useCallback((id: string): boolean => {
    return scheduledListRef.current.has(id);
  }, []);

  /**
   * Clear all scheduled notifications
   */
  const clearAll = useCallback((): void => {
    if (!schedulerRef.current) return;

    schedulerRef.current.clearAllNotifications();
    scheduledListRef.current.clear();
    console.log('[useNotificationScheduler] Cleared all scheduled notifications');
  }, []);

  return {
    scheduleNotification,
    scheduleDaily,
    scheduleWeekly,
    cancelNotification,
    getScheduledNotifications,
    getScheduledNotification,
    isScheduled,
    clearAll,
  };
};

export default useNotificationScheduler;
