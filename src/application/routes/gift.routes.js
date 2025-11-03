const express = require('express');
const router = express.Router();
const giftController = require('../controller/gift.controller');
const giftValidator = require('../validator/gift.validator');

/**
 * SMS Server Gift Routes
 * 
 * Gift notification SMS endpoint
 */

// Send gift notification endpoint
router.post(
  '/notify',
  giftValidator.validateSendGiftNotification,
  giftController.sendGiftNotification
);

module.exports = router;

