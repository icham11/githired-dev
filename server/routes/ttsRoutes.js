const express = require("express");
const router = express.Router();
const authenticateToken = require("../middlewares/auth");
const { synthesizeSpeech } = require("../services/aiService");

// Generate TTS audio from text using Groq Orpheus
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const buffer = await synthesizeSpeech(text);
    res.set("Content-Type", "audio/mpeg"); // Groq returns MP3
    res.send(buffer);
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ message: "Failed to synthesize speech" });
  }
});

module.exports = router;
