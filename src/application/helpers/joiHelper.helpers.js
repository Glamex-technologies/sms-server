const Joi = require('joi');

/**
 * Joi Validation Helper
 * Validates request data against Joi schema
 */
class JoiHelper {
  /**
   * Validate data against Joi schema
   * @param {Object} data - Data to validate
   * @param {Object} schema - Joi schema
   * @returns {Array|null} Array of errors or null if valid
   */
  static async joiValidation(data, schema) {
    try {
      const { error, value } = schema.validate(data, {
        abortEarly: false,
        stripUnknown: true,
      });

      if (error) {
        return error.details.map((detail) => ({
          message: detail.message,
          path: detail.path.join('.'),
          type: detail.type,
        }));
      }

      return null;
    } catch (err) {
      console.error('Joi validation error:', err);
      return [{ message: 'Validation error occurred', path: '', type: 'validation' }];
    }
  }
}

module.exports = JoiHelper;

