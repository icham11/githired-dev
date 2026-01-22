# 🎤 Voice Features Documentation

## Overview

GitHired now supports **bidirectional voice communication** during mock interviews, creating a realistic phone call experience.

## Features

### 1. 🎙️ Speech-to-Text (Voice Input)

- **Technology**: Web Speech API (built into modern browsers)
- **Location**: Interview chat interface
- **How it works**:
  - Click the microphone button 🎤 to start recording
  - Speak your answer naturally
  - The speech is automatically converted to text in the input field
  - Click the button again to stop recording (or it stops automatically after silence)
- **Language Support**:
  - English (`en-US`)
  - Indonesian (`id-ID`)
  - Automatically switches based on interview language setting
- **Browser Support**: Chrome, Edge, Safari (webkit)

### 2. 🔊 Text-to-Speech (Voice Output)

- **Technology**: ElevenLabs API (Rachel voice)
- **Location**: Automatic playback of AI interviewer responses
- **How it works**:
  - When the AI sends a response, it automatically converts to speech
  - High-quality MP3 audio plays immediately
  - Natural-sounding professional voice
- **Voice**: Rachel (clear, professional English voice)
- **Format**: MP3 audio
- **Quality**: Premium quality from ElevenLabs

## User Flow

```
┌─────────────────────────────────────────────────────────┐
│  1. User clicks mic button 🎤                           │
│  2. Browser asks for microphone permission              │
│  3. User speaks answer                                  │
│  4. Speech → Text (auto-filled in input)               │
│  5. User clicks send or hits Enter                     │
│  6. AI processes and responds                          │
│  7. AI text response → ElevenLabs TTS                  │
│  8. Audio automatically plays 🔊                        │
│  9. User hears AI voice asking next question           │
└─────────────────────────────────────────────────────────┘
```

## Technical Implementation

### Frontend (`InterviewPage.jsx`)

#### State Variables

```javascript
const [isRecording, setIsRecording] = useState(false);
const recognitionRef = useRef(null);
const lastSpokenIndex = useRef(-1);
```

#### Speech Recognition Setup

```javascript
useEffect(() => {
  if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === "Indonesian" ? "id-ID" : "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + " " + transcript);
      setIsRecording(false);
    };

    // Error and end handlers...
    recognitionRef.current = recognition;
  }
}, [language]);
```

#### Toggle Recording Function

```javascript
const toggleRecording = () => {
  if (!recognitionRef.current) {
    alert("Speech recognition is not supported in your browser");
    return;
  }

  if (isRecording) {
    recognitionRef.current.stop();
    setIsRecording(false);
  } else {
    recognitionRef.current.start();
    setIsRecording(true);
  }
};
```

#### Auto-play TTS

```javascript
useEffect(() => {
  if (!messages.length) return;
  const lastAssistantIndex = [...messages]
    .map((m, idx) => ({ ...m, idx }))
    .filter((m) => m.role === "assistant")
    .map((m) => m.idx)
    .pop();

  if (
    lastAssistantIndex !== undefined &&
    lastAssistantIndex > lastSpokenIndex.current
  ) {
    const text = messages[lastAssistantIndex].content;
    lastSpokenIndex.current = lastAssistantIndex;

    // Fire TTS fetch
    (async () => {
      try {
        const res = await api.post("/tts", { text }, { responseType: "blob" });
        const blob = res.data;
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.play();
      } catch (err) {
        console.error("TTS playback failed", err);
      }
    })();
  }
}, [messages]);
```

### Backend (`server/`)

#### TTS Route (`routes/ttsRoutes.js`)

```javascript
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const buffer = await synthesizeSpeech(text);
    res.set("Content-Type", "audio/mpeg");
    res.send(buffer);
  } catch (error) {
    console.error("TTS Error:", error);
    res.status(500).json({ message: "Failed to synthesize speech" });
  }
});
```

#### AI Service (`services/aiService.js`)

```javascript
synthesizeSpeech: async (text, outputPath = null) => {
  if (!process.env.ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY missing");
  }

  const audioStream = await textToSpeechStream(
    process.env.ELEVENLABS_API_KEY,
    "21m00Tcm4TlvDq8ikWAM", // Rachel voice ID
    text,
  );

  // Collect stream chunks into buffer
  const chunks = [];
  for await (const chunk of audioStream) {
    chunks.push(chunk);
  }
  const buffer = Buffer.concat(chunks);

  if (outputPath) {
    await fs.promises.writeFile(outputPath, buffer);
  }

  return buffer;
};
```

## Environment Variables

```env
# AI Service - Groq (Interview Chat)
GROQ_API_KEY=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

# AI Service - ElevenLabs (TTS)
ELEVENLABS_API_KEY=sk_c630435323758e1f62a62acbb832f497e6eba045b0573acd
```

## UI Components

### Microphone Button

- **Icon**: `<Mic />` from lucide-react
- **Visual States**:
  - Normal: Secondary variant (white/10 background)
  - Recording: Red pulsing animation (`animate-pulse bg-red-500`)
- **Disabled**: When interview is loading
- **Tooltip**: "Start voice input" / "Stop recording"

### Placeholder Text

- **Not Recording**: "Type or speak your answer..."
- **Recording**: "Listening..."

## Browser Compatibility

### Speech Recognition (Input)

| Browser | Support    | Notes              |
| ------- | ---------- | ------------------ |
| Chrome  | ✅ Full    | Best support       |
| Edge    | ✅ Full    | Uses Chromium      |
| Safari  | ✅ Partial | Uses WebKit prefix |
| Firefox | ❌ None    | Not supported      |

### Audio Playback (Output)

| Browser    | Support | Notes           |
| ---------- | ------- | --------------- |
| All Modern | ✅ Full | HTML5 Audio API |

## Testing Instructions

1. **Start the server** (make sure dependencies are installed):

   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start the client**:

   ```bash
   cd client
   npm run dev
   ```

3. **Test Speech-to-Text**:
   - Navigate to Interview page
   - Start an interview session
   - Click the microphone button 🎤
   - Grant microphone permission if prompted
   - Speak clearly
   - Verify text appears in input field

4. **Test Text-to-Speech**:
   - Send a message to the AI
   - Wait for AI response
   - Verify audio automatically plays
   - Check browser console for any errors

5. **Test Complete Flow**:
   - Use voice to answer questions
   - Listen to AI voice responses
   - Verify natural conversation flow

## Troubleshooting

### Speech Recognition Issues

- **"Speech recognition is not supported"**: Use Chrome or Edge
- **No mic permission**: Check browser settings
- **Recognition stops immediately**: Speak more quickly after clicking button
- **Wrong language**: Verify language setting in interview setup

### TTS Issues

- **No audio plays**: Check browser console for errors
- **Audio quality poor**: Should be high quality; check API key
- **Audio doesn't play**: Check browser audio permissions
- **401 Unauthorized**: API key might be invalid

### API Errors

- **"ELEVENLABS_API_KEY missing"**: Check .env file
- **Rate limit exceeded**: ElevenLabs free tier has limits
- **Network error**: Check internet connection

## Cost Considerations

### Web Speech API (STT)

- **Cost**: FREE (browser-native)
- **Limits**: None

### ElevenLabs API (TTS)

- **Free Tier**: 10,000 characters/month
- **Paid Tiers**: Starting at $5/month for 30,000 characters
- **Average**: ~100-150 characters per AI response
- **Estimate**: Free tier = ~70-100 interview responses

## Future Enhancements

1. **Voice Selection**: Allow users to choose different voices (male/female, accents)
2. **Language Support**: Add more languages (Spanish, French, etc.)
3. **Real-time STT**: Show interim results while speaking
4. **Voice Activity Detection**: Auto-start recording when user speaks
5. **Noise Cancellation**: Filter background noise
6. **Audio Visualization**: Show sound waves while recording/playing
7. **Offline Support**: Cache TTS responses for common phrases

## Security Considerations

1. **Microphone Access**: Only requested when user clicks mic button
2. **Audio Data**: Not stored, processed in real-time
3. **API Keys**: Stored in .env, never exposed to client
4. **Authentication**: TTS endpoint requires JWT token
5. **Rate Limiting**: Consider adding to prevent abuse

## Performance Metrics

- **STT Latency**: ~100-500ms (depends on browser)
- **TTS API Call**: ~1-3 seconds for typical response
- **Audio Download**: ~100-300KB per response
- **Playback**: Immediate after download

## Conclusion

The voice features transform GitHired into a **realistic interview simulation platform**. Users can now practice speaking naturally, as they would in a real phone interview, while receiving natural-sounding voice feedback from the AI interviewer.

This creates a more immersive and effective learning experience compared to text-only interaction.
