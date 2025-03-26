const express = require('express');
const router = express.Router();
const twilioCallService = require('../services/twillioCallService');
const logger = require('../utils/logger');

router.post('/calls', async (req, res) => {
  try {
    if (!req.body.phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const call = await twilioCallService.initiateCall(req.body.phoneNumber);
    
    logger.log(call.sid, 'call-initiated');

    return res.status(200).json({
      success: true,
      callSid: call.sid,
      status: call.status
    });

  } catch (error) {
    console.error('Error initiating call:', error);
    return res.status(500).json({
      error: 'Failed to initiate call',
      message: error.message
    });
  }
});

module.exports = router;