const axios = require('axios');

/**
 * Unifonic SMS Helper
 * Handles integration with Unifonic SMS API for sending OTP messages
 * Documentation: https://docs.unifonic.com/articles/#!products-documentation/sending-your-first-sms-via-unifonic-api
 */
class UnifonicSmsHelper {
  constructor() {
    // Unifonic API Configuration from environment variables
    // API URLs from documentation
    this.apiUrl = process.env.UNIFONIC_API_URL || 'https://el.cloud.unifonic.com/rest/SMS/messages';
    this.appSid = process.env.UNIFONIC_APP_SID;
    this.senderId = process.env.UNIFONIC_SENDER_ID;
    
    // Log configuration for debugging
    console.log('📱 [SMS Server] Unifonic SMS Helper Configuration:');
    console.log('   API URL:', this.apiUrl);
    console.log('   AppSid:', this.appSid ? '✅ Configured' : '❌ Not configured');
    console.log('   Sender ID:', this.senderId || 'Not configured');

    // Validate critical configuration
    if (!this.appSid) {
      console.error('❌ [SMS Server] UNIFONIC_APP_SID is not set in environment variables!');
      console.error('   SMS sending will fail. Please configure UNIFONIC_APP_SID in your .env file.');
    }
    if (!this.senderId) {
      console.warn('⚠️  [SMS Server] WARNING: UNIFONIC_SENDER_ID is not set. SMS sending may fail.');
      console.warn('   Please configure UNIFONIC_SENDER_ID in your .env file.');
    }

    // Axios instance with default config
    this.client = axios.create({
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 30000, // 30 seconds timeout
    });
  }

  /**
   * Send SMS via Unifonic API
   * @param {string} recipientPhone - Recipient phone number (E.164 format: +countrycode+number)
   * @param {string} message - SMS message content
   * @param {Object} options - Additional options
   * @param {string} options.correlationId - Optional correlation ID for tracking
   * @returns {Promise<Object>} SMS sending result with message ID and status
   */
  async sendSms(recipientPhone, message, options = {}) {
    try {
      console.log('📤 [SMS Server] Preparing to send SMS:', {
        recipient: recipientPhone,
        messageLength: message.length,
        correlationId: options.correlationId || 'N/A',
        timestamp: new Date().toISOString(),
      });

      // Validate required configuration
      if (!this.appSid) {
        const error = new Error('Unifonic AppSid not configured');
        console.error('❌ [SMS Server] Configuration Error:', error.message);
        throw error;
      }

      if (!this.senderId) {
        console.warn('⚠️  [SMS Server] Warning: Sender ID not configured. Using default.');
      }

      // Format phone number (ensure it starts with country code)
      // Remove any spaces or dashes, ensure it starts with +
      let formattedPhone = recipientPhone.replace(/[\s-]/g, '');
      if (!formattedPhone.startsWith('+')) {
        formattedPhone = '+' + formattedPhone;
      }

      console.log('📱 [SMS Server] Formatted phone number:', {
        original: recipientPhone,
        formatted: formattedPhone,
      });

      // Prepare request payload according to Unifonic API specification
      // Unifonic uses form-urlencoded format
      const payload = new URLSearchParams();
      payload.append('AppSid', this.appSid);
      payload.append('Recipient', formattedPhone);
      payload.append('Body', message);
      
      if (this.senderId) {
        payload.append('SenderID', this.senderId);
      }

      // Log request details (without sensitive data)
      console.log('📨 [SMS Server] Request details:', {
        apiUrl: this.apiUrl,
        recipient: formattedPhone,
        messageLength: message.length,
        hasSenderId: !!this.senderId,
        correlationId: options.correlationId || 'N/A',
      });

      // Make API request to Unifonic
      const startTime = Date.now();
      const response = await this.client.post(this.apiUrl, payload.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
      const duration = Date.now() - startTime;

      console.log('✅ [SMS Server] SMS sent successfully:', {
        messageId: response.data?.MessageID || response.data?.messageId || 'N/A',
        status: response.data?.success ? 'Success' : response.data?.status || 'Unknown',
        duration: `${duration}ms`,
        correlationId: options.correlationId || 'N/A',
        timestamp: new Date().toISOString(),
        response: {
          success: response.data?.success !== false,
          messageId: response.data?.MessageID || response.data?.messageId,
          status: response.data?.status || response.data?.Status,
          data: response.data,
        },
      });

      // Return standardized response
      return {
        success: true,
        messageId: response.data?.MessageID || response.data?.messageId || null,
        status: response.data?.success !== false ? 'Sent' : 'Failed',
        response: response.data,
        recipient: formattedPhone,
        duration: duration,
      };

    } catch (error) {
      console.error('❌ [SMS Server] Failed to send SMS:', {
        error: error.message,
        recipient: recipientPhone,
        correlationId: options.correlationId || 'N/A',
        timestamp: new Date().toISOString(),
      });

      // Handle specific error cases
      if (error.response) {
        // API responded with error status
        console.error('❌ [SMS Server] API Error Response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          correlationId: options.correlationId || 'N/A',
        });
        
        throw {
          success: false,
          error: 'Unifonic API Error',
          message: error.response.data?.message || error.response.statusText || 'SMS sending failed',
          statusCode: error.response.status,
          details: error.response.data,
        };
      } else if (error.request) {
        // Request made but no response received
        console.error('❌ [SMS Server] Network Error:', {
          message: 'Unable to reach Unifonic SMS service',
          correlationId: options.correlationId || 'N/A',
        });
        
        throw {
          success: false,
          error: 'Network Error',
          message: 'Unable to reach Unifonic SMS service. Please try again.',
          details: error.message,
        };
      } else {
        // Error setting up request
        console.error('❌ [SMS Server] Request Setup Error:', {
          message: error.message,
          correlationId: options.correlationId || 'N/A',
        });
        
        throw {
          success: false,
          error: 'Request Error',
          message: `SMS sending failed: ${error.message}`,
          details: error.message,
        };
      }
    }
  }

  /**
   * Send OTP SMS via Unifonic
   * @param {string} recipientPhone - Recipient phone number (E.164 format: +countrycode+number)
   * @param {string} otpCode - OTP code (4 digits)
   * @param {Object} options - Additional options
   * @param {string} options.purpose - OTP purpose (registration, login, password_reset)
   * @param {string} options.entityId - Entity ID for tracking
   * @param {string} options.entityType - Entity type (user, provider, admin)
   * @returns {Promise<Object>} SMS sending result
   */
  async sendOtpSms(recipientPhone, otpCode, options = {}) {
    try {
      // Generate OTP message
      const otpMessage = this.formatOtpMessage(otpCode, options.purpose);
      
      // Generate correlation ID for tracking
      const correlationId = `${options.entityType || 'unknown'}_${options.entityId || 'unknown'}_${Date.now()}`;

      console.log('🔐 [SMS Server] Sending OTP SMS:', {
        recipient: recipientPhone,
        purpose: options.purpose || 'unknown',
        entityType: options.entityType || 'unknown',
        entityId: options.entityId || 'unknown',
        correlationId: correlationId,
        timestamp: new Date().toISOString(),
      });

      // Send SMS
      const result = await this.sendSms(recipientPhone, otpMessage, {
        correlationId: correlationId,
      });

      console.log('✅ [SMS Server] OTP SMS sent successfully:', {
        recipient: recipientPhone,
        purpose: options.purpose || 'unknown',
        entityType: options.entityType || 'unknown',
        entityId: options.entityId || 'unknown',
        messageId: result.messageId,
        correlationId: correlationId,
        timestamp: new Date().toISOString(),
      });

      return result;

    } catch (error) {
      console.error('❌ [SMS Server] Failed to send OTP SMS:', {
        recipient: recipientPhone,
        purpose: options.purpose || 'unknown',
        entityType: options.entityType || 'unknown',
        entityId: options.entityId || 'unknown',
        error: error.message || error,
        timestamp: new Date().toISOString(),
      });

      // Re-throw the error so calling code can handle it
      throw error;
    }
  }

  /**
   * Format OTP message based on purpose
   * @param {string} otpCode - OTP code
   * @param {string} purpose - OTP purpose
   * @returns {string} Formatted SMS message
   */
  formatOtpMessage(otpCode, purpose = 'registration') {
    // Default OTP message (can be customized)
    const baseMessage = `Your verification code is: ${otpCode}. This code will expire in 5 minutes.`;

    // Customize message based on purpose
    const purposeMessages = {
      registration: `Welcome! Your verification code is: ${otpCode}. This code will expire in 5 minutes.`,
      login: `Your login verification code is: ${otpCode}. This code will expire in 5 minutes.`,
      password_reset: `Your password reset code is: ${otpCode}. This code will expire in 5 minutes.`,
      phone_verification: `Your phone verification code is: ${otpCode}. This code will expire in 5 minutes.`,
    };

    return purposeMessages[purpose] || baseMessage;
  }
}

// Export singleton instance
module.exports = new UnifonicSmsHelper();

