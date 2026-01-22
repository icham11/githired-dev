// const { GoogleGenAI } = require("@google/genai");

// let ai = null;
// if (process.env.GEMINI_API_KEY) {
//   ai = new GoogleGenAI({ key: process.env.GEMINI_API_KEY });
// }

// const cleaneJSON = (text) => {
//   const match = text.match(/\{[\s\S]*\}/);
//   return match ? match[0] : text;
// };

// const getText = (result) => {
//   if (!result) return "";
//   if (typeof result === "string") return result.text;
//   if (typeof result === "function" && result.text) return result.text();
//   if (result.response && typeof result.response.text === "function")
//     return result.response.text();
//   if (result.candidates?.[0]?.content?.parts?.[0].text)
//     return result.candidates[0].content.parts[0].text;
//   return "";
// };

// const generateInterviewResponse = async (chatHistory, role) => {
//   if (!ai) throw new Error("AI service not initialized");

//   const systemInstruction = `You are a SENIOR Technical Recruiter for ${role}.
//   Be STRICT and PROFESSIONAL.
//   Always ask ONE technical question based on the candidate's last answer.
//   Return JSON: { "message": "Your question", "isCorrect": boolean }`;

//   const contents = [
//     { role: "user", parts: [{ text: `System: ${systemInstruction}` }] },
//     { role: "model", parts: [{ text: "Understood." }] },
//     ...chatHistory.map((msg) => ({
//       role: msg.role === "assistant" ? "model" : "user",
//       parts: [{ text: msg.content }],
//     })),
//   ];

//   try {
//     const result = await ai.models.generateContent({
//       model: "gemini-3-pro-preview",
//       contents: contents,
//       config: { response_mime_type: "application/json" },
//     });
//     const textResult = getText(result);
//     const cleaned = cleaneJSON(textResult);
//     return JSON.parse(cleaned);
//   } catch (error) {
//     console.error("AI error", error);
//     return {
//       message: "AI sedang sibuk, silakan coba lagi nanti.",
//       isCorrect: true,
//     };
//   }
// };

// module.exports = {
//   generateInterviewResponse,
// };

const { GoogleGenAI } = require("@google/genai");

let ai = null;

if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ key: process.env.GEMINI_API_KEY });
}

// Helper: Sleep
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to clean JSON
const cleanJSON = (text) => {
  // Simple robust JSON extractor
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
};

// Helper: Universal Text Getter (Robust)
const getText = (result) => {
  if (!result) return "";
  if (typeof result.text === "function") return result.text();
  if (typeof result.text === "string") return result.text;
  if (result.response && typeof result.response.text === "function") {
    return result.response.text();
  }
  if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
    return result.candidates[0].content.parts[0].text;
  }
  return "";
};

const analyzeResume = async (resumeText) => {
  if (process.env.USE_MOCK_AI === "true") {
    // Mock Data
    return {
      score: 88,
      feedback: "Mock Mode",
      feedback_en: "Mock Mode",
      feedback_id: "Mode Mock",
    };
  }

  if (!ai) return { score: 0, feedback: "API Key missing." };

  try {
    const prompt = `You are an expert HR. Analyze this resume. Return JSON:
    {
      "score": <0-100>,
      "feedback_en": "<English feedback>",
      "feedback_id": "<Indonesian feedback>"
    }
    Resume: ${resumeText}`;

    // Application limit handle by retrying
    const callAI = async () => {
      return await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        config: { response_mime_type: "application/json" },
        contents: prompt,
      });
    };

    let result;
    try {
      result = await callAI();
    } catch (e) {
      if (e.status === 429) {
        await sleep(2000);
        result = await callAI();
      } else {
        throw e;
      }
    }

    console.log("🚀 ~ analyzeResume ~ result:", result);

    // Safety: Response might stick to old 429 behavior or text structure
    const text = getText(result);
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
      score: parsed.score,
      feedback: parsed.feedback_en,
      feedback_en: parsed.feedback_en,
      feedback_id: parsed.feedback_id,
    };
  } catch (error) {
    console.error("Resume AI Error:", error);
    return { score: 0, feedback: "Error analyzing resume. Please try again." };
  }
};

const generateInterviewResponse = async (
  chatHistory,
  role,
  difficulty,
  language,
) => {
  if (!ai) return { message: "API Key missing", isCorrect: false };

  // New SDK Format: contents = [{ role: 'user'|'model', parts: [{ text: ... }] }]
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

  const contents = [
    {
      role: "user",
      parts: [{ text: `System Instruction: ${systemInstruction}` }],
    },
    { role: "model", parts: [{ text: "Understood." }] },
    ...chatHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
  ];

  const callAI = async (modelName, config = {}) => {
    try {
      const result = await ai.models.generateContent({
        model: modelName,
        config: config,
        contents: contents,
      });
      const text = getText(result);
      try {
        return JSON.parse(cleanJSON(text));
      } catch (e) {
        console.warn("JSON Parse Failed, using raw text:", text);
        return { message: text, isCorrect: true };
      }
    } catch (err) {
      throw err;
    }
  };

  try {
    return await callAI("gemini-3-pro-preview", {
      response_mime_type: "application/json",
    });
  } catch (error) {
    console.log(
      `Interview Primary Error (${error.status || error.message})...`,
    );

    if (error.status === 429 || error.message.includes("429")) {
      console.log("Rate Limit. Waiting 5s...");
      await sleep(5000);
      try {
        return await callAI("gemini-3-pro-preview", {
          response_mime_type: "application/json",
        });
      } catch (e) {
        return {
          message: "Server is busy (Rate Limit). Please wait 20s.",
          isCorrect: false,
        };
      }
    }

    return { message: "Error: " + error.message, isCorrect: false };
  }
};

const evaluateInterview = async (chatHistory, role, language = "English") => {
  if (!ai) return { score: 0, feedback: "API Key missing" };
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
    const result = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      config: { response_mime_type: "application/json" },
      contents: prompt,
    });
    return JSON.parse(cleanJSON(getText(result)));
  } catch (error) {
    console.error("Eval Error:", error);
    // Fallback
    if (
      error.message.includes("404") ||
      error.status === 429 ||
      error.message.includes("503")
    ) {
      try {
        console.log("Evaluation Fallback (Retrying)...");
        const resRetry = await ai.models.generateContent({
          model: "gemini-3-pro-preview",
          contents: prompt,
        });
        const textRetry = getText(resRetry);
        return JSON.parse(cleanJSON(textRetry));
      } catch (e) {
        console.error("Eval Fallback Failed:", e);
      }
    }
    return {
      score: 70,
      feedback: "Evaluation Error (AI Busy). Please try again.",
    };
  }
};

module.exports = {
  analyzeResume,
  generateInterviewResponse,
  evaluateInterview,
};
