const express = require('express');
const router = express.Router();
const { initiateCall } = require('../services/twillioCallService');
const Logger = require('../utils/logger');

router.post('/call', async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    if (!phoneNumber) {
      Logger.log('N/A', 'validation-error', 'Phone number missing');
      return res.status(400).json({ error: 'Phone number is required' });
    }

    const call = await initiateCall(phoneNumber);
    Logger.log(call.sid, 'initiated', `Calling ${phoneNumber}`);
    
    res.json({
      success: true,
      callSid: call.sid,
      status: call.status
    });
  } catch (error) {
    Logger.log('N/A', 'error', error.message);
    console.error('Error making call:', error);
    res.status(500).json({ 
      error: 'Failed to initiate call',
      message: error.message 
    });
  }
});

module.exports = router;