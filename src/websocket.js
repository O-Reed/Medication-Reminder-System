const WebSocket = require('ws');
const { createClient, LiveTranscriptionEvents } = require('@deepgram/sdk');
const elevenLabs = require('../services/ttsService');
const Logger = require('./utils/logger');

module.exports = (server) => {
  const wss = new WebSocket.Server({ server });
  const deepgramClient = createClient(process.env.DEEPGRAM_API_KEY);

  wss.on('connection', (ws) => {
    let deepgramLive;
    let keepAliveInterval;

    const initDeepgram = async () => {
      deepgramLive = deepgramClient.listen.live({
        punctuate: true,
        model: 'nova-3',
        sampling_rate: 16000
      });

      if (keepAliveInterval) clearInterval(keepAliveInterval);
      keepAliveInterval = setInterval(() => {
        if (deepgramLive && deepgramLive.getReadyState() === 1) { 
          deepgramLive.keepAlive();
        }
      }, 10 * 1000);

      deepgramLive.addListener(LiveTranscriptionEvents.Open, () => {
        Logger.log(ws.callSid, 'stt-connected', 'Speech recognition started');
      });

      deepgramLive.addListener(LiveTranscriptionEvents.Transcript, (transcript) => {
        const response = transcript.channel.alternatives[0].transcript;
        
        if (response.trim()) {
          Logger.log(ws.callSid, 'patient-response', response);
        }
      });

      deepgramLive.addListener(LiveTranscriptionEvents.Error, (error) => {
        Logger.log(ws.callSid, 'stt-error', error.message);
      });

      deepgramLive.addListener(LiveTranscriptionEvents.Close, () => {
        Logger.log(ws.callSid, 'stt-disconnected', 'Speech recognition ended');
        clearInterval(keepAliveInterval);
      });
    };

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        if (message.event === 'media' && deepgramLive?.getReadyState() === 1) {
          deepgramLive.send(message.media.payload);
        }
      } catch (error) {
        Logger.log(ws.callSid, 'error', 'Failed to process audio data');
      }
    });

    ws.on('close', () => {
      if (deepgramLive) {
        deepgramLive.finish();
        deepgramLive.removeAllListeners();
        deepgramLive = null;
      }
      clearInterval(keepAliveInterval);
    });

    elevenLabs.generateTTSStream('Hello... your medications...', (audioStream) => {
      audioStream.on('data', (chunk) => {
        ws.send(JSON.stringify({
          event: 'media',
          media: {
            payload: chunk.toString('base64'),
          }
        }));
      });
    });

    initDeepgram();
  });
};