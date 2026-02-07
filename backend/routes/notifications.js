/**
 * Notification Routes
 * Handles WhatsApp and SMS notifications
 */

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

/**
 * POST /api/notifications/whatsapp
 * Send WhatsApp notification
 */
router.post('/whatsapp', notificationController.sendWhatsAppNotification);

/**
 * POST /api/notifications/sms
 * Send SMS notification
 */
router.post('/sms', notificationController.sendSmsNotification);

/**
 * POST /api/notifications/bulk
 * Send bulk notifications to multiple recipients
 */
router.post('/bulk', notificationController.sendBulkNotifications);

/**
 * POST /api/notifications/test
 * Send test notification (for development)
 */
router.post('/test', notificationController.sendTestNotification);

/**
 * GET /api/notifications/status
 * Get notification service status
 */
router.get('/status', notificationController.getNotificationStatus);

/**
 * POST /api/notifications/webhook
 * Receive webhook from Twilio (for incoming messages)
 */
router.post('/webhook', notificationController.handleWebhook);

module.exports = router;
