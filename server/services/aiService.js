const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");

let groq = null;

if (process.env.GROQ_API_KEY) {
  groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
}

// Helper: Sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to clean JSON
const cleanJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
};

const analyzeResume = async (resumeText) => {
  if (process.env.USE_MOCK_AI === "true") {
    return {
      score: 88,
      feedback: "Mock Mode",
      feedback_en: "Mock Mode",
      feedback_id: "Mode Mock",
    };
  }

  if (!groq) return { score: 0, feedback: "API Key missing." };

  try {
    const prompt = `You are an expert HR . Analyze this resume and provide detailed feedback. Return your response in valid JSON format with this exact structure:
    {
      "score": <number between 0-100>,
      "feedback_en": "<detailed English feedback>",
      "feedback_id": "<detailed Indonesian feedback>"
    }
    
    Resume Content:
    ${resumeText}
    
    Provide specific, actionable feedback about strengths and areas for improvement.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert HR analyst. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";
    let parsed;

    try {
      parsed = JSON.parse(cleanJSON(text));
    } catch (e) {
      console.warn("Resume JSON Parse Failed, fallback.");
      return {
        score: 70,
        feedback: text,
        feedback_en: text,
        feedback_id: text,
      };
    }

    return {
      score: parsed.score || 70,
      feedback: parsed.feedback_en || parsed.feedback || "Analysis completed",
      feedback_en:
        parsed.feedback_en || parsed.feedback || "Analysis completed",
      feedback_id: parsed.feedback_id || parsed.feedback || "Analisis selesai",
    };
  } catch (error) {
    console.error("Resume AI Error:", error);
    return {
      score: 0,
      feedback: "Error analyzing resume. Please try again.",
      feedback_en: "Error analyzing resume. Please try again.",
      feedback_id:
        "Terjadi kesalahan saat menganalisis resume. Silakan coba lagi.",
    };
  }
};

const generateInterviewResponse = async (
  chatHistory,
  role,
  difficulty,
  language,
) => {
  if (!groq) return { message: "API Key missing", isCorrect: false };

  const systemInstruction = `You are a SENIOR Technical Recruiter for the role of ${role}. 
  Your demeanor is PROFESSIONAL, STRICT, BUT FAIR. You value depth over breadth.
  
  DIFFICULTY LEVEL: ${difficulty}.
  LANGUAGE REQUIREMENT: Conduct the interview STRICTLY in ${language}. 

  **CORE PERSONALITY**:
  - **Senior Authority**: Speak like a seasoned engineer/manager. No fluff.
  - **Brutally Honest**: If the user's answer is shallow or wrong, say it clearly (e.g., "That is incorrect/simplistic because..."). Do not sugarcoat bad technical answers.
  - **Dynamic**: Vary your questioning style (Scenario-based, Theory, System Design).
  
  **SESSION FLOW**:
  1. **Phase 1 (Opening/First Question)**: 
     - Do NOT start with a generic "Hello [Name], nice to meet you."
     - VARIETY IS KEY. 
     - Start IMMEDIATELY with the question. Minimal pleasantries.
  
  2. **Phase 2 (Q&A Loop)**:
     - The user answers.
     - **EVALUATE**: Provide HONEST feedback. If they are wrong, correct them briefly.
     - **CRITICAL RULE**: NEVER end your response with just feedback or "Do you understand?".
     - **IMMEDIATE FOLLOW-UP**: You MUST ask the next technical question immediately in the same message.
     - Example: "That is incorrect. React Memo does shallow comparison. Now, moving on: How does useEffect handle dependency changes?"
  
  **OUTPUT RULES**:
  - Return JSON: { "message": "Your response here", "isCorrect": boolean }
  - "isCorrect": true (passable) or false (incorrect/weak).
  - Do NOT repeat the user's answer.
  - Keep responses concise but impactful.`;

  const messages = [
    {
      role: "system",
      content: systemInstruction,
    },
    ...chatHistory.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    })),
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages: messages,
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.8,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";

    try {
      return JSON.parse(cleanJSON(text));
    } catch (e) {
      console.warn("JSON Parse Failed, using raw text:", text);
      return { message: text, isCorrect: true };
    }
  } catch (error) {
    console.error("Interview AI Error:", error);

    if (error.message.includes("rate") || error.message.includes("429")) {
      return {
        message: "Server is busy. Please wait a moment and try again.",
        isCorrect: false,
      };
    }

    return {
      message: "Error: Unable to generate response. Please try again.",
      isCorrect: false,
    };
  }
};

const evaluateInterview = async (chatHistory, role, language = "English") => {
  if (!groq) return { score: 0, feedback: "API Key missing" };

  const prompt = `You are a CRITICAL HR EXAMINER. Evaluate this interview session and return the result in JSON.

  *** CRITICAL LANGUAGE INSTRUCTION ***
  You MUST write the entire "feedback" value in ${language}.
  If the target language is "Indonesian", you MUST translate your thoughts and output into formal Bahasa Indonesia (Bahasa Baku).
  Do NOT output English in the "feedback" field.

  Chat History:
  ${JSON.stringify(chatHistory)}

  **SCORING CRITERIA (BE STRICT)**:
  - **Precision**: Did they answer specific technical details or just give vague concepts? Penalize vague answers.
  - **Depth**: Did they show deep understanding or surface-level knowledge?
  - **Correction**: If they made mistakes, did they recover?
  
  **SCORING SCALE**:
  - < 50: Poor. Major concepts missed.
  - 50-70: Average. Knows basics but lacks depth.
  - 70-85: Good. Strong technical foundation.
  - 85+: Exceptional. Senior-level expertise.
  
  Return ONLY a JSON object with this structure:
  {
    "score": <number 0-100>,
    "feedback": "<concise feedback in ${language} on where they failed and where they succeeded>"
  }
  
  *** REMEMBER: THE FEEDBACK MUST BE IN ${language} ***`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a critical HR examiner. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(cleanJSON(text));
  } catch (error) {
    console.error("Eval Error:", error);
    return {
      score: 70,
      feedback:
        language === "Indonesian"
          ? "Terjadi kesalahan saat evaluasi. Silakan coba lagi."
          : "Evaluation Error. Please try again.",
    };
  }
};

module.exports = {
  analyzeResume,
  generateInterviewResponse,
  evaluateInterview,

  /**
   * Text-to-Speech via Groq (Orpheus v1 English model).
   * Returns audio buffer (MP3 format).
   */
  synthesizeSpeechGroq: async (text, outputPath = null) => {
    if (!groq) {
      throw new Error("GROQ_API_KEY missing");
    }
    if (!text || !text.trim()) {
      throw new Error("No text provided for TTS");
    }

    try {
      const response = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: text,
          },
        ],
        model: "canopylabs/orpheus-v1-english",
        temperature: 1,
        max_tokens: 1024,
        top_p: 1,
        stream: false,
        modalities: ["audio"],
        audio: {
          voice: "alloy",
          format: "mp3",
        },
      });

      // Get audio data from response
      const audioData = response.choices[0]?.message?.audio?.data;
      if (!audioData) {
        throw new Error("No audio data returned from Groq");
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(audioData, "base64");

      if (outputPath) {
        const speechFile = path.resolve(outputPath);
        await fs.promises.writeFile(speechFile, buffer);
      }

      return buffer;
    } catch (error) {
      console.error("Groq TTS Error:", error);
      throw new Error("Failed to synthesize speech with Groq Orpheus");
    }
  },

  /**
   * Text-to-Speech using Groq Orpheus.
   * This is the main TTS function used by the app.
   */
  synthesizeSpeech: async (text, outputPath = null) => {
    return module.exports.synthesizeSpeechGroq(text, outputPath);
  },
};
