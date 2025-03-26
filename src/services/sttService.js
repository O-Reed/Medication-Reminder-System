
const axios = require('axios');
const config = require('../config/env');

class STTService {
  async transcribeSpeech(audioFile) {
    const response = await axios.post('https://api.deepgram.com/v1/speech-to-text', 
      audioFile,
      {
        headers: {
          'Authorization': `Token ${config.deepgram.apiKey}`,
          'Content-Type': 'audio/wav'
        }
      }
    );
    return response.data.results.transcripts[0].text;
  }
}

module.exports = new STTService();