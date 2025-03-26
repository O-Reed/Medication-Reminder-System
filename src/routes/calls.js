const express = require('express');
const router = express.Router();
const { VoiceResponse } = require('twilio').twiml;
const ttsService = require('../services/ttsService');
const logger = require('../utils/logger');

router.post('/answer', async (req, res) => {
  const twiml = new VoiceResponse();
  const { CallSid, AnsweredBy } = req.body;
  
  if (AnsweredBy === 'machine') {
    logger.log(CallSid, 'voicemail', 'Left voicemail message');
    twiml.play(`${process.env.BASE_URL}/public/voicemail.mp3`);
  } else {
    logger.log(CallSid, 'human-answer', 'Starting medication confirmation');
    
    const medications = ['Aspirin', 'Cardivol', 'Metformin'];
    const message = `Hello, this is a reminder from your healthcare provider to confirm your medications for the day. Please confirm if you have taken your ${medications.join(', ')} today.`;

    twiml.start().stream({
      url: `wss://${process.env.BASE_URL}/websocket`,
      track: 'both'
    });

    const audioStream = await ttsService.generateTTSStream(message);
    twiml.play(audioStream);

    logger.log(CallSid, 'prompt-played', `Asked about: ${medications.join(', ')}`);
  }
  
  res.type('text/xml').send(twiml.toString());
});

router.post('/status', async (req, res) => {
  const { CallSid, CallStatus, To } = req.body;
  logger.log(CallSid, CallStatus, `Call to ${To}`);

  if(CallStatus === 'no-answer') {
    await twilioService.sendSMS(
      To,
      'We called to check on your medication...'
    );
    logger.log(CallSid, 'sms-sent', `SMS sent to ${To}`);
  }
  res.sendStatus(200);
});