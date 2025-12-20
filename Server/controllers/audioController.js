const fs = require('fs');
const Groq = require('groq-sdk');
const dotenv = require('dotenv');

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

class AudioController {
  async transcribeAudio(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No audio file uploaded'
        });
      }

      // Process audio with Groq
      const translation = await groq.audio.translations.create({
        file: fs.createReadStream(req.file.path),
        model: 'whisper-large-v3',
        prompt: req.body.prompt || 'Translate this nepali language audio into english language text',
        language: req.body.language || 'en',
        response_format: 'json',
        temperature: parseFloat(req.body.temperature) || 0.0,
      });

      // Clean up uploaded file
      fs.unlinkSync(req.file.path);

      return res.status(200).json({
        success: true,
        data: {
          text: translation.text,
          model: 'whisper-large-v3',
          language: req.body.language || 'en'
        }
      });

    } catch (error) {
      console.error('Transcription error:', error);
      
      // Clean up file if it exists
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(500).json({
        success: false,
        message: error.message || 'Error transcribing audio',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
}

module.exports = new AudioController();