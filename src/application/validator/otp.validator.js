const Joi = require('joi');
const JoiHelper = require('../helpers/joiHelper.helpers');
const ResponseHelper = require('../helpers/response.helpers');
const response = new ResponseHelper();

/**
 * OTP Validator
 * Validates OTP generation requests
 */
class OtpValidator {
  /**
   * Validate generate OTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async validateGenerateOtp(req, res, next) {
    console.log('📋 [SMS Server] OtpValidator@validateGenerateOtp');
    
    try {
      // Define validation schema
      const schema = Joi.object({
        entity_type: Joi.string()
          .valid('user', 'provider', 'admin')
          .required()
          .messages({
            'any.only': 'entity_type must be one of: user, provider, admin',
            'any.required': 'entity_type is required',
            'string.empty': 'entity_type cannot be empty',
          }),
        
        entity_id: Joi.string()
          .uuid({ version: 'uuidv4' })
          .required()
          .messages({
            'string.guid': 'entity_id must be a valid UUID',
            'any.required': 'entity_id is required',
            'string.empty': 'entity_id cannot be empty',
          }),
        
        phone_code: Joi.string()
          .pattern(/^\d{1,4}$/)
          .required()
          .messages({
            'string.pattern.base': 'phone_code must be 1-4 digits',
            'any.required': 'phone_code is required',
            'string.empty': 'phone_code cannot be empty',
          }),
        
        phone_number: Joi.string()
          .pattern(/^\d{6,15}$/)
          .required()
          .messages({
            'string.pattern.base': 'phone_number must be 6-15 digits',
            'any.required': 'phone_number is required',
            'string.empty': 'phone_number cannot be empty',
          }),
        
        purpose: Joi.string()
          .valid('registration', 'login', 'password_reset', 'phone_verification')
          .required()
          .messages({
            'any.only': 'purpose must be one of: registration, login, password_reset, phone_verification',
            'any.required': 'purpose is required',
            'string.empty': 'purpose cannot be empty',
          }),
      });

      // Validate request body against schema
      const errors = await JoiHelper.joiValidation(req.body, schema);
      
      if (errors) {
        return response.validationError(
          'Validation failed',
          res,
          { details: errors[0] }
        );
      }

      // Validation passed
      next();
    } catch (err) {
      console.error('❌ [SMS Server] Validation Error:', err);
      return response.exception('Server error occurred during validation', res);
    }
  }
}

module.exports = new OtpValidator();

