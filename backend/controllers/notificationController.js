/**
 * Notification Controller
 * Handles WhatsApp and SMS notifications via Twilio
 */

const twilio = require('twilio');

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  console.warn('TWILIO credentials not configured. Notifications will be mocked.');
}

const twilioClient = accountSid ? twilio(accountSid, authToken) : null;

/**
 * Send WhatsApp notification
 * POST /api/notifications/whatsapp
 */
exports.sendWhatsAppNotification = async (req, res) => {
  try {
    const { phoneNumber, message, farmerId } = req.body;

    // Validate required fields
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber and message are required',
      });
    }

    // Normalize phone number (remove +, add +91 for India if needed)
    let normalizedNumber = phoneNumber.replace(/[^\d]/g, '');
    if (!normalizedNumber.startsWith('91')) {
      normalizedNumber = `91${normalizedNumber.slice(-10)}`;
    }

    const fullNumber = `+${normalizedNumber}`;

    console.log(`[WhatsApp] Sending message to ${fullNumber}: ${message}`);

    if (!twilioClient) {
      // Mock response for testing
      console.log('[WhatsApp] MOCK MODE - Message would be sent');
      return res.status(200).json({
        success: true,
        message: 'WhatsApp message queued (mock mode)',
        phoneNumber: fullNumber,
        farmerId,
      });
    }

    // Send WhatsApp message via Twilio
    const response = await twilioClient.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${fullNumber}`,
      body: message,
    });

    console.log(`[WhatsApp] ✓ Message sent with SID: ${response.sid}`);

    res.status(200).json({
      success: true,
      message: 'WhatsApp notification sent',
      messageSid: response.sid,
      phoneNumber: fullNumber,
      farmerId,
    });
  } catch (error) {
    console.error('[WhatsApp] Error sending notification:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to send WhatsApp notification',
      details: error.message,
    });
  }
};

/**
 * Send SMS notification
 * POST /api/notifications/sms
 */
exports.sendSmsNotification = async (req, res) => {
  try {
    const { phoneNumber, message, farmerId } = req.body;

    // Validate required fields
    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber and message are required',
      });
    }

    // Normalize phone number
    let normalizedNumber = phoneNumber.replace(/[^\d]/g, '');
    if (!normalizedNumber.startsWith('91')) {
      normalizedNumber = `91${normalizedNumber.slice(-10)}`;
    }

    const fullNumber = `+${normalizedNumber}`;

    console.log(`[SMS] Sending message to ${fullNumber}: ${message}`);

    if (!twilioClient) {
      // Mock response for testing
      console.log('[SMS] MOCK MODE - Message would be sent');
      return res.status(200).json({
        success: true,
        message: 'SMS queued (mock mode)',
        phoneNumber: fullNumber,
        farmerId,
      });
    }

    // Send SMS via Twilio
    const response = await twilioClient.messages.create({
      from: process.env.TWILIO_SMS_NUMBER,
      to: fullNumber,
      body: message,
    });

    console.log(`[SMS] ✓ Message sent with SID: ${response.sid}`);

    res.status(200).json({
      success: true,
      message: 'SMS notification sent',
      messageSid: response.sid,
      phoneNumber: fullNumber,
      farmerId,
    });
  } catch (error) {
    console.error('[SMS] Error sending notification:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to send SMS notification',
      details: error.message,
    });
  }
};

/**
 * Get Twilio webhook status
 * For receiving incoming messages (optional)
 * POST /api/notifications/webhook
 */
exports.handleWebhook = async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;

    console.log(`[Webhook] Received message from ${From}: ${Body}`);

    // TODO: Process incoming WhatsApp/SMS messages
    // This could trigger automated responses, update farmer records, etc.

    res.status(200).json({
      success: true,
      message: 'Webhook processed',
    });
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to process webhook',
    });
  }
};

/**
 * Send bulk notifications
 * POST /api/notifications/bulk
 */
exports.sendBulkNotifications = async (req, res) => {
  try {
    const { recipients, message, type = 'whatsapp' } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'recipients array is required',
      });
    }

    if (!message) {
      return res.status(400).json({
        success: false,
        error: 'message is required',
      });
    }

    console.log(`[Bulk] Sending ${type} to ${recipients.length} recipients`);

    const results = [];
    const errors = [];

    for (const recipient of recipients) {
      try {
        const { phoneNumber, farmerId } = recipient;

        if (!phoneNumber) {
          errors.push({
            farmerId,
            error: 'phoneNumber missing',
          });
          continue;
        }

        let normalizedNumber = phoneNumber.replace(/[^\d]/g, '');
        if (!normalizedNumber.startsWith('91')) {
          normalizedNumber = `91${normalizedNumber.slice(-10)}`;
        }

        const fullNumber = `+${normalizedNumber}`;

        if (!twilioClient) {
          results.push({
            farmerId,
            phoneNumber: fullNumber,
            success: true,
            mock: true,
          });
          continue;
        }

        let response;
        if (type === 'sms') {
          response = await twilioClient.messages.create({
            from: process.env.TWILIO_SMS_NUMBER,
            to: fullNumber,
            body: message,
          });
        } else {
          response = await twilioClient.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${fullNumber}`,
            body: message,
          });
        }

        results.push({
          farmerId,
          phoneNumber: fullNumber,
          success: true,
          messageSid: response.sid,
        });
      } catch (error) {
        errors.push({
          farmerId: recipient.farmerId,
          phoneNumber: recipient.phoneNumber,
          error: error.message,
        });
      }
    }

    console.log(`[Bulk] Sent to ${results.length}, failed: ${errors.length}`);

    res.status(200).json({
      success: true,
      message: `Notifications sent to ${results.length} recipients`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      total: recipients.length,
      successful: results.length,
      failed: errors.length,
    });
  } catch (error) {
    console.error('[Bulk] Error sending bulk notifications:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to send bulk notifications',
      details: error.message,
    });
  }
};

/**
 * Test notification endpoint (for development)
 * POST /api/notifications/test
 */
exports.sendTestNotification = async (req, res) => {
  try {
    const { phoneNumber, type = 'whatsapp' } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        error: 'phoneNumber is required',
      });
    }

    const testMessage = '🐄 Moo Music Tracker Test - Your app is working! 🎵';

    if (type === 'sms') {
      return exports.sendSmsNotification(
        {
          body: {
            phoneNumber,
            message: testMessage,
            farmerId: 'test-farmer',
          },
        },
        res
      );
    }

    // Default to WhatsApp
    return exports.sendWhatsAppNotification(
      {
        body: {
          phoneNumber,
          message: testMessage,
          farmerId: 'test-farmer',
        },
      },
      res
    );
  } catch (error) {
    console.error('[Test] Error sending test notification:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to send test notification',
      details: error.message,
    });
  }
};

/**
 * Get notification status
 * GET /api/notifications/status
 */
exports.getNotificationStatus = async (req, res) => {
  try {
    const hasCredentials = !!(accountSid && authToken);

    res.status(200).json({
      success: true,
      status: {
        twilio: {
          configured: hasCredentials,
          accountSid: hasCredentials ? accountSid.substring(0, 5) + '...' : null,
          whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'NOT_SET',
          smsNumber: process.env.TWILIO_SMS_NUMBER || 'NOT_SET',
        },
      },
    });
  } catch (error) {
    console.error('[Status] Error getting notification status:', error);

    res.status(500).json({
      success: false,
      error: 'Failed to get notification status',
    });
  }
};
