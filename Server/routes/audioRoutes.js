const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const audioController = require('../controllers/audioController');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/mp3', 'video/mp4'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'), false);
    }
  },
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB
  }
});

// Routes
router.post('/transcribe', upload.single('audio'), audioController.transcribeAudio);

module.exports = router;