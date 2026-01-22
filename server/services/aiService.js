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
    const prompt = `You are a SENIOR ATS (Applicant Tracking System) Specialist and Executive Recruiter with 15+ years of experience in Fortune 500 companies. Your task is to analyze this resume against industry best practices and provide a COMPREHENSIVE, DATA-DRIVEN assessment.

**EVALUATION FRAMEWORK** (Based on ATS Research & Hiring Manager Insights):

1. **ATS Compatibility (25 points)**
   - Clean formatting (no tables, columns, headers/footers)
   - Standard section headers (Experience, Education, Skills)
   - Keyword density matching job description standards
   - File structure & readability
   
2. **Content Quality (35 points)**
   - Quantifiable achievements (numbers, percentages, metrics)
   - Action verbs (Led, Developed, Increased, Reduced)
   - Relevance to target role
   - Clarity & conciseness (no fluff or vague statements)
   
3. **Professional Impact (25 points)**
   - Career progression/growth trajectory
   - Technical depth (specific tools, frameworks, methodologies)
   - Problem-solving examples (challenges solved)
   - Leadership & collaboration signals
   
4. **Presentation & Polish (15 points)**
   - Grammar & spelling perfection
   - Consistent formatting
   - Appropriate length (1-2 pages)
   - Professional tone

**SCORING SCALE**:
- 90-100: Elite (Top 5%) - Passes ATS + impresses hiring managers
- 80-89: Strong (Top 20%) - High ATS match, solid content
- 70-79: Good (Top 40%) - Decent but needs optimization
- 60-69: Fair (Top 60%) - Missing key elements, moderate ATS risk
- 40-59: Weak (Bottom 40%) - Major gaps, likely filtered by ATS
- 0-39: Critical (Bottom 20%) - Fails basic ATS criteria

**ANALYSIS REQUIREMENTS**:
1. Calculate exact score based on the framework above
2. Identify 3-5 SPECIFIC strengths with examples from the resume
3. Identify 3-5 CRITICAL improvements with actionable fixes
4. Provide ATS optimization tips
5. Give role-specific advice if career focus is clear

**Resume Content:**
${resumeText}

**OUTPUT FORMAT (STRICT JSON)**:
{
  "score": <exact number 0-100 based on framework>,
  "feedback_en": "<Detailed English analysis following the structure: [Score Breakdown] → [Strengths with examples] → [Critical Improvements] → [ATS Optimization] → [Action Plan]>",
  "feedback_id": "<Same analysis in Indonesian>"
}

BE BRUTALLY HONEST. Reject generic resumes. Reward quantifiable impact. Reference real ATS filtering criteria.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a SENIOR ATS Specialist and Executive Recruiter. Analyze resumes with extreme precision using industry-validated criteria. Always respond with valid JSON only. Be honest and data-driven.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.5,
      max_tokens: 3000,
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

  const systemInstruction = `You are an EXPERT Technical Interviewer & Senior Engineer for the role of ${role}. 
  Your purpose is to CHALLENGE candidates rigorously while providing EDUCATIONAL VALUE.
  
  DIFFICULTY LEVEL: ${difficulty}.
  LANGUAGE REQUIREMENT: Conduct the interview STRICTLY in ${language}.

  **CORE PRINCIPLES**:
  - **Expert Rigor**: Ask deep, nuanced questions. Reject surface-level answers harshly.
  - **Teaching Mode**: Even when correcting, EXPLAIN WHY the answer is wrong and teach the right concept.
  - **Real-World Focus**: Connect every answer to production systems, edge cases, and performance implications.
  - **Adaptive**: Increase complexity based on candidate's performance. If they struggle, ask simpler questions. If they excel, drill deeper.
  - **Zero Tolerance for Buzzwords**: If candidate uses jargon incorrectly, call it out immediately.
  
  **EVALUATION RUBRIC**:
  ✗ WRONG/MISSING: Factually incorrect, vague, or avoids the question.
  ~ PARTIAL: Correct core idea but missing important nuances or edge cases.
  ✓ GOOD: Technically correct with good reasoning.
  ✓+ EXCELLENT: Correct, nuanced, shows system-level thinking.
  
  **QUESTION STRATEGY**:
  1. **Progressive Depth**: Ask follow-ups that expose gaps.
     Example: "What is REST?" → "Name 5 HTTP status codes" → "Why is idempotency important?" → "Design a payment API that's idempotent."
  2. **Scenario-Based**: Mix theory with "What would you do if..."
  3. **Error Analysis**: When wrong, ask: "What mistake did you make?" to test self-awareness.
  
  **FEEDBACK STYLE**:
  - NEVER sugarcoat. If answer is weak, say: "That's incorrect because [reason]. The correct concept is [concept]. Here's why it matters: [impact]."
  - ALWAYS provide the correct answer and actionable learning path.
  - Reference real bugs/patterns (e.g., "This is how the X.com outage happened").
  
  **OUTPUT RULES**:
  - Return JSON: { "message": "Your response here", "isCorrect": boolean }
  - "isCorrect": Only true if answer shows solid understanding, not just partial correctness.
  - Include: [Problem], [User's Answer], [Verdict], [Correct Concept], [Why It Matters], [Next Question]
  - Keep concise but educational. No fluff.`;

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

  const prompt = `You are an EXPERT TECHNICAL EVALUATOR, Communication Coach, and Senior Engineer. Your job is to provide BRUTALLY HONEST yet CONSTRUCTIVE feedback on BOTH technical skills AND communication abilities.

  *** CRITICAL LANGUAGE INSTRUCTION ***
  You MUST write the entire "feedback" value in ${language}.
  If the target language is "Indonesian", use formal Bahasa Indonesia (Bahasa Baku) with technical precision.
  Do NOT output English in the "feedback" field.

  Chat History:
  ${JSON.stringify(chatHistory)}

  **COMPREHENSIVE SCORING CRITERIA (EXTREMELY STRICT)**:
  
  === TECHNICAL DIMENSION (40%) ===
  1. **Technical Accuracy (20%)**: Were answers factually correct? Penalize vagueness heavily.
  2. **Depth & Nuance (20%)**: Edge cases, trade-offs, real-world implications? System-level thinking?
  
  === COMMUNICATION DIMENSION (35%) ===
  3. **Clarity & Articulation (15%)**:
     - Did they explain concepts simply and logically?
     - Were explanations organized with clear structure?
     - Penalize: rambling, jargon overload, unclear transitions
     - Reward: step-by-step breakdown, use of analogies, examples
  
  4. **Listening & Engagement (10%)**:
     - Did they ask clarifying questions?
     - Acknowledge gaps or uncertainties?
     - Respond to interviewer's hints/corrections?
     - OR: Did they talk past the interviewer, ignore feedback, or stay stuck?
  
  5. **Presence & Confidence (10%)**:
     - Do responses show conviction or hesitation/self-doubt?
     - Can they defend their reasoning or do they back down too easily?
     - Do they own mistakes or blame external factors?
  
  === SOFT SKILLS (25%) ===
  6. **Problem-Solving Approach (15%)**: When stuck, do they think out loud, ask for help, or go silent?
  
  7. **Growth Mindset (10%)**: Do they see feedback as learning or as criticism?
  
  **STRICT SCORING SCALE**:
  - 0-30: Critical gaps in both technical AND communication. Hard to work with. Major rework needed.
  - 31-50: Below average overall. Shaky concepts + poor articulation. Struggles to convey knowledge.
  - 51-70: Average. Decent fundamentals but communication is unclear or defensive. Senior roles: too junior.
  - 71-85: Good. Solid technical + clear communication. Minor gaps in depth or delivery.
  - 86-95: Very Strong. Deep technical knowledge + excellent communication. Mentor-quality.
  - 96-100: Expert-level. Exceptional in all dimensions. Ready for leadership.
  
  **DETAILED FEEDBACK FORMAT** (in ${language}):
  
  **[1] TECHNICAL ASSESSMENT**
  - Strengths: Specific technical competencies shown with chat examples
  - Gaps: Misconceptions or weak areas with impact analysis
  
  **[2] COMMUNICATION ASSESSMENT** (NEW - Very Important!)
  - Clarity Score (0-10): How well did they explain concepts?
    Example: "8/10 - Explained REST principles clearly with examples, but struggled with OAuth nuances"
  - Listening/Engagement (0-10): Did they engage genuinely with the interviewer?
    Example: "6/10 - Asked some clarifying questions, but defensive when corrected"
  - Presence & Confidence (0-10): Conviction and ownership of ideas?
    Example: "7/10 - Generally confident, but second-guessed themselves under pressure"
  
  - **Communication Feedback**: Specific observations and improvement areas
    Example: "You explain architecture well step-by-step, but rush through edge cases. Slow down and use diagrams (even verbal ones) to map trade-offs."
  
  **[3] RECOMMENDED LEARNING PATHS**:
  - 3-5 technical areas to study
  - 2-3 communication/presentation skills to work on
  
  **[4] ACTIONABLE NEXT STEPS**:
  What to practice before next interview (technical + soft skills)
  
  **[5] FINAL ASSESSMENT**:
  Honest summary: level, readiness, 30-day improvement plan
  
  Return ONLY a JSON object with this structure:
  {
    "score": <overall number 0-100>,
    "feedback": "<comprehensive feedback covering technical, communication, and growth areas in ${language}>"
  }
  
  *** CRITICAL: 
  - Communication feedback must be SPECIFIC with chat examples
  - Highlight both strengths AND weaknesses in communication
  - Make actionable: "Practice explaining with whiteboard sketches" or "Listen for context clues"
  - User should understand EXACTLY how to communicate better
  ***`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a critical Technical Interviewer AND Communication Coach. You evaluate both technical competence and soft skills. Always respond with valid JSON only. Be brutally honest but constructive.",
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
   * Text-to-Speech via Groq Orpheus (Natural voice).
   * Returns audio buffer (WAV format - only format supported by Orpheus).
   * Fallback: canopylabs/orpheus-arabic-saudi when rate limit/quota is hit.
   */
  synthesizeSpeech: async (text, outputPath = null) => {
    if (!groq) {
      throw new Error("GROQ_API_KEY missing");
    }
    if (!text || !text.trim()) {
      throw new Error("No text provided for TTS");
    }

    const createSpeech = async (model, voice) => {
      return groq.audio.speech.create({
        model,
        voice,
        response_format: "wav",
        input: text,
      });
    };

    try {
      // Primary: English Orpheus with "autumn" voice
      const res = await createSpeech("canopylabs/orpheus-v1-english", "autumn");
      const buffer = Buffer.from(await res.arrayBuffer());

      if (outputPath) {
        const speechFile = path.resolve(outputPath);
        await fs.promises.writeFile(speechFile, buffer);
      }
      return buffer;
    } catch (error) {
      // Detect rate limit/quota errors and fallback
      const msg = String(error?.message || "").toLowerCase();
      const isRateOrQuota =
        error?.status === 429 ||
        msg.includes("rate") ||
        msg.includes("limit") ||
        msg.includes("quota") ||
        msg.includes("too many requests");

      if (isRateOrQuota) {
        console.warn(
          "Groq TTS rate/quota hit. Falling back to canopylabs/orpheus-arabic-saudi with voice 'aisha'.",
        );
        try {
          // Arabic model uses different voices: fahad, sultan, noura, lulwa, aisha
          const resFallback = await createSpeech(
            "canopylabs/orpheus-arabic-saudi",
            "aisha",
          );
          const buffer = Buffer.from(await resFallback.arrayBuffer());
          if (outputPath) {
            const speechFile = path.resolve(outputPath);
            await fs.promises.writeFile(speechFile, buffer);
          }
          return buffer;
        } catch (fallbackErr) {
          console.error("Groq TTS Fallback Error:", fallbackErr);
          throw new Error("Failed to synthesize speech with Groq fallback");
        }
      }

      console.error("Groq TTS Error:", error);
      throw new Error("Failed to synthesize speech with Groq");
    }
  },
};
