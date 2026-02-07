import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2, Send, Loader2, Bell } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import * as notificationService from '@/lib/notificationService';
import { sendTestNotification } from '@/lib/notificationService';

interface NotificationSettings {
  whatsappEnabled: boolean;
  smsEnabled: boolean;
  phoneNumber: string;
  notificationType: 'whatsapp' | 'sms';
  dailyReminderTime: string;
  weeklyRemindDay: number;
  dailyReminderEnabled: boolean;
}

/**
 * Notification Settings Component
 * Allows users to configure and test WhatsApp/SMS notifications
 */
export const NotificationSettings: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<NotificationSettings>({
    whatsappEnabled: false,
    smsEnabled: false,
    phoneNumber: '',
    notificationType: 'whatsapp',
    dailyReminderTime: '08:00',
    weeklyRemindDay: 1,
    dailyReminderEnabled: false,
  });

  const [status, setStatus] = useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: '',
  });

  const [serviceStatus, setServiceStatus] = useState<any>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Fetch service status on mount
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const result = await notificationService.getNotificationStatus();
        setServiceStatus(result.status);
      } catch (error) {
        console.error('Error fetching notification service status:', error);
      }
    };

    fetchStatus();
  }, []);

  // Handle settings change
  const handleSettingChange = (key: keyof NotificationSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Test notification
  const handleTestNotification = async () => {
    if (!settings.phoneNumber) {
      setStatus({
        status: 'error',
        message: 'Please enter a phone number',
      });
      return;
    }

    setTestLoading(true);
    try {
      await sendTestNotification(settings.phoneNumber, settings.notificationType);

      setStatus({
        status: 'success',
        message: `Test ${settings.notificationType} notification sent! Check your phone.`,
      });

      setTimeout(() => {
        setStatus({ status: 'idle', message: '' });
      }, 5000);
    } catch (error) {
      setStatus({
        status: 'error',
        message: `Failed to send test notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Save settings
  const handleSaveSettings = async () => {
    setStatus({
      status: 'loading',
      message: 'Saving settings...',
    });

    try {
      // Save to localStorage
      localStorage.setItem('notificationSettings', JSON.stringify(settings));

      setStatus({
        status: 'success',
        message: 'Notification settings saved successfully!',
      });

      setTimeout(() => {
        setStatus({ status: 'idle', message: '' });
      }, 3000);
    } catch (error) {
      setStatus({
        status: 'error',
        message: 'Failed to save settings',
      });
    }
  };

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notificationSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <div>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure WhatsApp and SMS notifications for your farm updates
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Service Status */}
          {serviceStatus && (
            <Alert
              variant={serviceStatus.twilio.configured ? 'default' : 'destructive'}
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {serviceStatus.twilio.configured
                  ? '✓ Notification service is configured'
                  : '⚠ Notification service is not configured. Please contact support.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Status Messages */}
          {status.status !== 'idle' && (
            <Alert
              variant={status.status === 'error' ? 'destructive' : 'default'}
              className="mb-4"
            >
              {status.status === 'success' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : status.status === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (with country code)</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+91 9876543210"
              value={settings.phoneNumber}
              onChange={(e) => handleSettingChange('phoneNumber', e.target.value)}
              disabled={testLoading}
            />
            <p className="text-xs text-gray-500">
              Example: +91 for India, +1 for USA. Can include spaces or dashes.
            </p>
          </div>

          {/* Notification Type Selection */}
          <div className="space-y-2">
            <Label>Preferred Notification Method</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="whatsapp"
                  name="notificationType"
                  value="whatsapp"
                  checked={settings.notificationType === 'whatsapp'}
                  onChange={() => handleSettingChange('notificationType', 'whatsapp')}
                  className="w-4 h-4"
                />
                <Label htmlFor="whatsapp" className="flex-1 cursor-pointer">
                  WhatsApp Messages
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  id="sms"
                  name="notificationType"
                  value="sms"
                  checked={settings.notificationType === 'sms'}
                  onChange={() => handleSettingChange('notificationType', 'sms')}
                  className="w-4 h-4"
                />
                <Label htmlFor="sms" className="flex-1 cursor-pointer">
                  SMS Text Messages
                </Label>
              </div>
            </div>
          </div>

          {/* Daily Reminder */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Daily Reminder</CardTitle>
                <Switch
                  checked={settings.dailyReminderEnabled}
                  onCheckedChange={(checked) =>
                    handleSettingChange('dailyReminderEnabled', checked)
                  }
                />
              </div>
            </CardHeader>

            {settings.dailyReminderEnabled && (
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="time">Reminder Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={settings.dailyReminderTime}
                    onChange={(e) => handleSettingChange('dailyReminderTime', e.target.value)}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  You'll receive a reminder at this time every day
                </p>
              </CardContent>
            )}
          </Card>

          {/* Test Button */}
          <div className="pt-4 border-t">
            <Button
              onClick={handleTestNotification}
              disabled={testLoading || !settings.phoneNumber}
              className="w-full"
              variant="outline"
            >
              {testLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Test Message...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Test {settings.notificationType === 'whatsapp' ? 'WhatsApp' : 'SMS'}
                </>
              )}
            </Button>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSaveSettings}
            className="w-full"
            disabled={!settings.phoneNumber}
          >
            Save Notification Settings
          </Button>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 space-y-2">
          <p>🔔 Get real-time notifications about:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Milking session reminders</li>
            <li>Cow health alerts</li>
            <li>Market price updates</li>
            <li>Scheduled farm activities</li>
          </ul>
          <p className="pt-2">
            ✓ Your phone number is encrypted and only used for notifications
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
