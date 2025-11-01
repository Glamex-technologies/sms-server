const express = require('express');
const router = express.Router();
const otpController = require('../controller/otp.controller');
const otpValidator = require('../validator/otp.validator');

/**
 * SMS Server Routes
 * 
 * This server has only one main endpoint for OTP generation
 */

// Health check endpoint (no validation needed)
router.get('/health', otpController.healthCheck);

// Generate OTP endpoint (main API)
router.post(
  '/generate',
  otpValidator.validateGenerateOtp,
  otpController.generateOtp
);

module.exports = router;

