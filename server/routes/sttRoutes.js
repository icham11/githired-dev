const express = require("express");
const router = express.Router();
const multer = require("multer");
const authenticateToken = require("../middlewares/auth");
const Groq = require("groq-sdk");
const fs = require("fs");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Configure multer for audio upload (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "audio/webm",
      "audio/wav",
      "audio/mp3",
      "audio/mpeg",
      "audio/ogg",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid audio format"));
    }
  },
});

// Convert speech to text using Groq Whisper
router.post(
  "/",
  authenticateToken,
  upload.single("audio"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Audio file is required" });
      }

      // Save buffer to temporary file (Groq needs file path)
      const tempPath = `/tmp/audio-${Date.now()}.webm`;
      await fs.promises.writeFile(tempPath, req.file.buffer);

      const transcription = await groq.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: "whisper-large-v3-turbo",
        // Language hint; if unsupported, Groq will auto-detect
        language: req.body.language === "Indonesian" ? "id" : "en",
      });

      // Clean up temp file
      await fs.promises.unlink(tempPath).catch(() => {});

      // Groq SDK returns { text: "..." } similar to OpenAI
      const text = transcription?.text || "";
      if (!text) {
        console.warn("STT Empty text response:", transcription);
      }
      res.json({ text });
    } catch (error) {
      console.error("STT Error:", error);
      res.status(500).json({
        message: "Failed to transcribe audio",
        error: error?.message || "Unknown error",
      });
    }
  },
);

module.exports = router;
