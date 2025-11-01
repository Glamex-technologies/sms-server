const db = require('../../startup/model');
const OtpVerification = db.models.OtpVerification;
const ResponseHelper = require('../helpers/response.helpers');
const response = new ResponseHelper();

/**
 * SMS Server OTP Controller
 * Single endpoint for OTP generation and SMS sending
 */
class OtpController {
  /**
   * Generate and send OTP via SMS
   * This is the single API endpoint for the SMS server
   * 
   * POST /otp/generate
   * 
   * Request Body:
   * {
   *   entity_type: 'user' | 'provider' | 'admin',
   *   entity_id: UUID,
   *   phone_code: string,
   *   phone_number: string,
   *   purpose: 'registration' | 'login' | 'password_reset' | 'phone_verification'
   * }
   */
  async generateOtp(req, res) {
    console.log('📱 [SMS Server] OtpController@generateOtp - Request received');
    const data = req.body;

    try {
      // Validate required fields
      if (!data.entity_type || !data.entity_id || !data.phone_code || !data.phone_number || !data.purpose) {
        return response.badRequest(
          'Missing required fields: entity_type, entity_id, phone_code, phone_number, purpose',
          res
        );
      }

      // Validate entity_type
      if (!['user', 'provider', 'admin'].includes(data.entity_type)) {
        return response.badRequest(
          'Invalid entity_type. Must be one of: user, provider, admin',
          res
        );
      }

      // Validate purpose
      if (!['registration', 'login', 'password_reset', 'phone_verification'].includes(data.purpose)) {
        return response.badRequest(
          'Invalid purpose. Must be one of: registration, login, password_reset, phone_verification',
          res
        );
      }

      // Validate UUID format for entity_id
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.entity_id)) {
        return response.badRequest(
          'Invalid entity_id format. Must be a valid UUID',
          res
        );
      }

      // Format phone number (phone_code + phone_number)
      const phoneNumber = data.phone_code + data.phone_number;

      console.log('📝 [SMS Server] Generating OTP:', {
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        phone_number: phoneNumber,
        purpose: data.purpose,
        timestamp: new Date().toISOString(),
      });

      // Create OTP using the model method
      const otpRecord = await OtpVerification.createForEntity(
        data.entity_type,
        data.entity_id,
        phoneNumber,
        data.purpose
      );

      console.log('✅ [SMS Server] OTP generated successfully:', {
        otp_id: otpRecord.id,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        purpose: data.purpose,
        expires_at: otpRecord.expires_at,
        timestamp: new Date().toISOString(),
      });

      // Return success response (without exposing OTP code for security)
      const result = {
        otp_id: otpRecord.id,
        entity_type: otpRecord.entity_type,
        entity_id: otpRecord.entity_id,
        phone_code: data.phone_code,
        phone_number: data.phone_number,
        purpose: otpRecord.purpose,
        expires_at: otpRecord.expires_at,
        created_at: otpRecord.created_at,
      };

      return response.success(
        'OTP generated and sent successfully via SMS',
        res,
        result
      );

    } catch (error) {
      console.error('❌ [SMS Server] Error in generateOtp:', {
        error: error.message || error,
        errorDetails: error,
        requestData: {
          entity_type: data.entity_type,
          entity_id: data.entity_id,
          purpose: data.purpose,
        },
        timestamp: new Date().toISOString(),
      });

      return response.exception(
        'Failed to generate OTP. Please try again.',
        res,
        { error: error.message || 'Internal server error' }
      );
    }
  }

  /**
   * Health check endpoint
   * GET /health
   */
  async healthCheck(req, res) {
    try {
      // Test database connection
      await db.sequelize.authenticate();
      
      return response.success(
        'SMS Server is healthy',
        res,
        {
          status: 'ok',
          database: 'connected',
          timestamp: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('❌ [SMS Server] Health check failed:', error);
      
      return response.exception(
        'SMS Server health check failed',
        res,
        { error: error.message || 'Database connection error' }
      );
    }
  }
}

module.exports = new OtpController();

