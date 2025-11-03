const Joi = require('joi');
const JoiHelper = require('../helpers/joiHelper.helpers');
const ResponseHelper = require('../helpers/response.helpers');
const response = new ResponseHelper();

/**
 * Gift Validator
 * Validates gift notification requests
 */
class GiftValidator {
  /**
   * Validate send gift notification request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async validateSendGiftNotification(req, res, next) {
    console.log('📋 [SMS Server] GiftValidator@validateSendGiftNotification');
    
    try {
      // Define validation schema
      const schema = Joi.object({
        gift_id: Joi.string()
          .uuid({ version: 'uuidv4' })
          .required()
          .messages({
            'string.guid': 'gift_id must be a valid UUID',
            'any.required': 'gift_id is required',
            'string.empty': 'gift_id cannot be empty',
          }),
        
        recipient_phone_code: Joi.string()
          .pattern(/^\d{1,4}$/)
          .required()
          .messages({
            'string.pattern.base': 'recipient_phone_code must be 1-4 digits',
            'any.required': 'recipient_phone_code is required',
            'string.empty': 'recipient_phone_code cannot be empty',
          }),
        
        recipient_phone_number: Joi.string()
          .pattern(/^\d{6,15}$/)
          .required()
          .messages({
            'string.pattern.base': 'recipient_phone_number must be 6-15 digits',
            'any.required': 'recipient_phone_number is required',
            'string.empty': 'recipient_phone_number cannot be empty',
          }),
        
        recipient_first_name: Joi.string()
          .min(1)
          .max(50)
          .required()
          .messages({
            'string.min': 'recipient_first_name must be at least 1 character',
            'string.max': 'recipient_first_name must not exceed 50 characters',
            'any.required': 'recipient_first_name is required',
            'string.empty': 'recipient_first_name cannot be empty',
          }),
        
        recipient_last_name: Joi.string()
          .min(1)
          .max(50)
          .required()
          .messages({
            'string.min': 'recipient_last_name must be at least 1 character',
            'string.max': 'recipient_last_name must not exceed 50 characters',
            'any.required': 'recipient_last_name is required',
            'string.empty': 'recipient_last_name cannot be empty',
          }),
        
        sender_first_name: Joi.string()
          .min(1)
          .max(50)
          .required()
          .messages({
            'string.min': 'sender_first_name must be at least 1 character',
            'string.max': 'sender_first_name must not exceed 50 characters',
            'any.required': 'sender_first_name is required',
            'string.empty': 'sender_first_name cannot be empty',
          }),
        
        sender_last_name: Joi.string()
          .min(1)
          .max(50)
          .required()
          .messages({
            'string.min': 'sender_last_name must be at least 1 character',
            'string.max': 'sender_last_name must not exceed 50 characters',
            'any.required': 'sender_last_name is required',
            'string.empty': 'sender_last_name cannot be empty',
          }),
        
        service_provider_name: Joi.string()
          .min(1)
          .max(200)
          .required()
          .messages({
            'string.min': 'service_provider_name must be at least 1 character',
            'string.max': 'service_provider_name must not exceed 200 characters',
            'any.required': 'service_provider_name is required',
            'string.empty': 'service_provider_name cannot be empty',
          }),
        
        service_name: Joi.string()
          .min(1)
          .max(200)
          .required()
          .messages({
            'string.min': 'service_name must be at least 1 character',
            'string.max': 'service_name must not exceed 200 characters',
            'any.required': 'service_name is required',
            'string.empty': 'service_name cannot be empty',
          }),
        
        message: Joi.string()
          .allow(null, '')
          .max(1000)
          .optional()
          .messages({
            'string.max': 'message must not exceed 1000 characters',
          }),
        
        deeplink_url: Joi.string()
          .uri()
          .optional()
          .allow(null, '')
          .messages({
            'string.uri': 'deeplink_url must be a valid URL',
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

module.exports = new GiftValidator();

