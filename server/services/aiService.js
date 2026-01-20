const { GoogleGenAI } = require("@google/genai");
const { text } = require("express");

let ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({ key: process.env.GEMINI_API_KEY });
}

const cleaneJSON = (text) => {
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : text;
};

const getText = (result) => {
  if (!result) return "";
  if (typeof result === "string") return result.text;
  if (typeof result === "function" && result.text) return result.text();
  if (result.response && typeof result.response.text === "function")
    return result.response.text();
  if (result.candidates?.[0]?.content?.parts?.[0].text)
    return result.candidates[0].content.parts[0].text;
  return "";
};

const generateInterviewResponse = async (chatHistory, role) => {
  if (!ai) throw new Error("AI service not initialized");

  const systemInstruction = `You are a SENIOR Technical Recruiter for ${role}.
  Be STRICT and PROFESSIONAL. 
  Always ask ONE technical question based on the candidate's last answer.
  Return JSON: { "message": "Your question", "isCorrect": boolean }`;

  const contents = [
    { role: "user", parts: [{ text: `System: ${systemInstruction}` }] },
    { role: "model", parts: [{ text: "Understood." }] },
    ...chatHistory.map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
  ];

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contents,
      config: { response_mime_type: "application/json" },
    });
    const textResult = getText(result);
    const cleaned = cleaneJSON(textResult);
    return JSON.parse(cleaned);
  } catch (error) {
    console.error("AI error", error);
    return {
      message: "AI sedang sibuk, silakan coba lagi nanti.",
      isCorrect: true,
    };
  }
};

module.exports = {
  generateInterviewResponse,
};
