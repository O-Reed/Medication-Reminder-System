const axios = require('axios');
const { PassThrough } = require('stream');

class TTSService {
  async generateTTSStream(text) {
    try {
      const response = await axios.post(
        `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_LABS_VOICE_ID}/stream`,
        { text },
        {
          responseType: 'stream',
          headers: {
            'xi-api-key': process.env.ELEVEN_LABS_API_KEY,
            'Content-Type': 'application/json'
          }
        }
      );

      const audioStream = new PassThrough();
      response.data.pipe(audioStream);
      return audioStream;

    } catch (error) {
      console.error('TTS Error:', error);
      throw new Error('Failed to generate speech');
    }
  }
}

module.exports = new TTSService();