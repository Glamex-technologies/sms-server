const db = require('../../startup/model');
const ResponseHelper = require('../helpers/response.helpers');
const UnifonicSmsHelper = require('../helpers/unifonicSms.helpers');
const response = new ResponseHelper();

/**
 * SMS Server Gift Controller
 * Handles gift notification SMS sending
 */
class GiftController {
  /**
   * Send gift notification SMS to recipient
   * This is the API endpoint for gift notification
   * 
   * POST /gift/notify
   * 
   * Request Body:
   * {
   *   gift_id: UUID,
   *   recipient_phone_code: string,
   *   recipient_phone_number: string,
   *   recipient_first_name: string,
   *   recipient_last_name: string,
   *   sender_first_name: string,
   *   sender_last_name: string,
   *   service_provider_name: string,
   *   service_name: string,
   *   message: string (optional),
   *   deeplink_url: string
   * }
   */
  async sendGiftNotification(req, res) {
    console.log('🎁 [SMS Server] GiftController@sendGiftNotification - Request received');
    const data = req.body;

    try {
      // Validate required fields
      if (!data.gift_id || !data.recipient_phone_code || !data.recipient_phone_number || 
          !data.recipient_first_name || !data.recipient_last_name || 
          !data.sender_first_name || !data.sender_last_name || 
          !data.service_provider_name || !data.service_name) {
        return response.badRequest(
          'Missing required fields: gift_id, recipient_phone_code, recipient_phone_number, recipient_first_name, recipient_last_name, sender_first_name, sender_last_name, service_provider_name, service_name',
          res
        );
      }

      // Validate UUID format for gift_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.gift_id)) {
        return response.badRequest(
          'Invalid gift_id format. Must be a valid UUID',
          res
        );
      }

      // Format phone number (phone_code + phone_number)
      const phoneNumber = data.recipient_phone_code + data.recipient_phone_number;

      console.log('📝 [SMS Server] Sending gift notification SMS:', {
        gift_id: data.gift_id,
        recipient_phone: phoneNumber,
        recipient_name: `${data.recipient_first_name} ${data.recipient_last_name}`,
        sender_name: `${data.sender_first_name} ${data.sender_last_name}`,
        service_provider_name: data.service_provider_name,
        service_name: data.service_name,
        timestamp: new Date().toISOString(),
      });

      // Format the SMS message according to the image description
      const smsMessage = this.formatGiftNotificationMessage(
        data.recipient_first_name,
        data.recipient_last_name,
        data.sender_first_name,
        data.sender_last_name,
        data.service_provider_name,
        data.service_name,
        data.message
      );

      // Generate correlation ID for tracking
      const correlationId = `gift_${data.gift_id}_${Date.now()}`;

      // Send SMS via Unifonic
      const smsResult = await UnifonicSmsHelper.sendSms(phoneNumber, smsMessage, {
        correlationId: correlationId,
      });

      console.log('✅ [SMS Server] Gift notification SMS sent successfully:', {
        gift_id: data.gift_id,
        recipient_phone: phoneNumber,
        messageId: smsResult.messageId,
        correlationId: correlationId,
        timestamp: new Date().toISOString(),
      });

      // Return success response
      const result = {
        gift_id: data.gift_id,
        recipient_phone_code: data.recipient_phone_code,
        recipient_phone_number: data.recipient_phone_number,
        message_id: smsResult.messageId,
        status: 'sent',
        sent_at: new Date().toISOString(),
      };

      return response.success(
        'Gift notification SMS sent successfully',
        res,
        result
      );

    } catch (error) {
      console.error('❌ [SMS Server] Error in sendGiftNotification:', {
        error: error.message || error,
        errorDetails: error,
        requestData: {
          gift_id: data.gift_id,
          recipient_phone_code: data.recipient_phone_code,
          recipient_phone_number: data.recipient_phone_number,
        },
        timestamp: new Date().toISOString(),
      });

      return response.exception(
        'Failed to send gift notification SMS. Please try again.',
        res,
        { error: error.message || 'Internal server error' }
      );
    }
  }

  /**
   * Format gift notification SMS message
   * Message structure:
   * - Header: "Gift received from Glamax"
   * - Service Provider
   * - Service
   * - Sender
   * - Message for you (optional)
   * - Download app instruction
   * 
   * @param {string} recipientFirstName - Recipient first name
   * @param {string} recipientLastName - Recipient last name
   * @param {string} senderFirstName - Sender first name
   * @param {string} senderLastName - Sender last name
   * @param {string} serviceProviderName - Service provider name
   * @param {string} serviceName - Service name
   * @param {string} personalMessage - Personal message (optional)
   * @returns {string} Formatted SMS message
   */
  formatGiftNotificationMessage(
    recipientFirstName,
    recipientLastName,
    senderFirstName,
    senderLastName,
    serviceProviderName,
    serviceName,
    personalMessage
  ) {
    // Build message
    let message = `Gift received from Glamax\n\n`;
    
    // Add gift details
    message += `Service Provider: ${serviceProviderName}\n`;
    message += `Service: ${serviceName}\n`;
    message += `Sender: ${senderFirstName} ${senderLastName}\n`;
    
    // Add personal message if provided
    if (personalMessage && personalMessage.trim()) {
      message += `\nMessage for you:\n${personalMessage}\n`;
    }
    
    // Add download app instruction
    message += `\nDownload the Glamex app`;
    
    return message;
  }
}

const giftController = new GiftController();

// Bind methods to preserve 'this' context
giftController.sendGiftNotification = giftController.sendGiftNotification.bind(giftController);

module.exports = giftController;

