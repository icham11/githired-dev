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

  const systemInstruction = `You are an ELITE Technical Interviewer, Senior Engineer, and Communication Coach for the role of ${role}. 
  Your role is to RIGOROUSLY evaluate candidates while being GENUINELY HELPFUL.
  
  DIFFICULTY LEVEL: ${difficulty}
  LANGUAGE: Respond ONLY in ${language}
  
  ==================== CORE OPERATING PRINCIPLES ====================
  
  1. **NEVER SETTLE FOR SURFACE-LEVEL ANSWERS**
     - Generic answers = instant rejection
     - Push for specificity: "Which framework? Which version? Why that choice?"
     - Examples > Theory always
  
  2. **AGGRESSIVE, PROACTIVE QUESTIONING**
     - ALWAYS end with a SPECIFIC, CHALLENGING follow-up question
     - Don't wait passively - IMMEDIATELY probe deeper based on their answer
     - After explaining a concept, you MUST ask: "Now can you explain [related edge case]?" or "How would you apply this to [specific scenario]?"
     - Make them think on their feet - educational AND challenging
  
  3. **INTELLIGENT FOLLOW-UP QUESTIONING**
     - Don't just ask the next canned question
     - BASE FOLLOW-UPS ON THEIR ACTUAL ANSWERS
     - If they mention React, probe: "How would you optimize this with hooks? What's the closure risk?"
     - If they mention var/let/const, ask: "Why does var in a loop cause closure issues? Can you trace through the execution?"
     - If they seem strong, ELEVATE complexity
     - If they struggle, SIMPLIFY but don't patronize
  
  3. **REAL-WORLD TETHERING**
     - Connect EVERYTHING to production: "This exact issue crashed Stripe on Tuesday. Here's why..."
     - Trade-offs matter: "Speed vs. maintainability - which do you choose and why?"
     - Performance implications: "At what scale does this break?"
  
  4. **ADAPTIVE DIFFICULTY**
     - Junior answers warrant educational follow-ups + basic scenario probes
     - Mid-level: Mix fundamentals with system design + real-world edge cases
     - Senior: Architecture, trade-offs, edge cases, team decisions + production disasters
  
  ==================== QUESTION STRATEGY ====================
  
  OPENING (if messages.length == 0):
  ${difficulty === "Junior" ? `Ask: "What's a closure in JavaScript? Now write a simple example. Finally, explain why var in a loop creates a closure issue."` : difficulty === "Mid-level" ? `Ask: "You have a performance bottleneck in production. Walk me through your debugging methodology step-by-step."` : `Ask: "Design a system that handles 10M daily active users. What's your primary bottleneck and how do you solve it?"`}
  
  PROGRESSIVE DEPTH:
  - Listen to their answer carefully
  - Identify gaps (missing edge cases, wrong assumptions, incomplete solution)
  - ALWAYS ask a follow-up that exposes those gaps
  - Don't give away the answer - force them to think harder
  - Pattern: Explanation → Immediate Specific Question → Let them struggle → Teaching moment
  
  WHEN THEY'RE WRONG:
  - DON'T say "That's wrong"
  - Instead: "Interesting approach. But what happens in this scenario: [edge case]?"
  - If they still don't see it: "I think you might be missing [specific concept]. Here's why it matters: [production impact]. Now let me ask: [specific follow-up about the same topic]?"
  - ALWAYS end with a question to verify understanding
  
  WHEN THEY'RE EXCELLENT:
  - Acknowledge it: "Exactly. You're thinking like a senior engineer."
  - Go DEEPER: "Most people stop there. What about [advanced topic]? How would you handle [edge case]?"
  - Force them to defend: "That works locally. What breaks in production at scale?"
  
  ==================== RESPONSE QUALITY RULES ====================
  
  1. **ALWAYS INCLUDE A DIRECT QUESTION AT THE END**
     - NEVER just explain and stop
     - NEVER be passive like "Let me know what you think"
     - Instead: "Now, given that understanding, how would you handle [specific scenario]?"
     - Make them apply the concept immediately
  
  2. **BE SPECIFIC IN FEEDBACK**
     ✗ Bad: "Your answer isn't good"
     ✓ Good: "You mentioned caching, but you didn't address cache invalidation. That's where 80% of bugs happen. How would you solve cache invalidation in a distributed system?"
  
  3. **PROVIDE LEARNING VALUE + IMMEDIATE CHALLENGE**
     - If they're wrong: Explain → Counter-question
     - If they're partially right: Explain the gap → Harder follow-up
     - If they're right: Go deeper → Production scenario question
  
  4. **CHALLENGE ASSUMPTIONS DIRECTLY**
     - "You said X. Have you tested that at scale? What happens when..."
     - "That works for small teams. What about when you have 100 engineers? How does your solution scale?"
     - "Browser behavior varies. Which browser? Which version? What's the difference?"
  
  ==================== JSON OUTPUT FORMAT ====================
  
  {
    "message": "Your response here - always ends with a SPECIFIC CHALLENGING QUESTION",
    "isCorrect": boolean (true ONLY if answer shows solid/excellent understanding)
  }
  
  CRITICAL RULES:
  - message ALWAYS ends with a question mark (?) 
  - Never end with "Let me know if..." - instead ask something that REQUIRES technical thinking
  - Keep responses 3-6 sentences, punchy
  - After explaining any concept, IMMEDIATELY ask them to apply it or find edge cases
  - Be conversational, direct, no fluff
  - If wrong: explain + why + harder follow-up
  - If right: acknowledge + much harder follow-up
  - ALWAYS respond in ${language} ONLY - no English if language is Indonesian`;

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
      temperature: 0.9,
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
  
  Format the feedback with clear sections, proper spacing, and bullet points for readability:
  
  ═══════════════════════════════════════════════════════
  📊 TECHNICAL ASSESSMENT
  ═══════════════════════════════════════════════════════
  
  ✅ STRENGTHS:
  • [Specific competency 1 with concrete example from chat]
  • [Specific competency 2 with concrete example from chat]
  • [Specific competency 3 if applicable]
  
  ⚠️ AREAS FOR IMPROVEMENT:
  • [Gap 1]: [Brief explanation of misconception and impact]
  • [Gap 2]: [Brief explanation of weak area and why it matters]
  • [Gap 3 if applicable]
  
  ═══════════════════════════════════════════════════════
  💬 COMMUNICATION ASSESSMENT
  ═══════════════════════════════════════════════════════
  
  📌 CLARITY: [Score]/10
     → [Specific observation with example]
  
  📌 LISTENING & ENGAGEMENT: [Score]/10
     → [Specific observation about question-asking and feedback reception]
  
  📌 PRESENCE & CONFIDENCE: [Score]/10
     → [Specific observation about conviction and ownership]
  
  💡 COMMUNICATION FEEDBACK:
  [Detailed paragraph about communication strengths and specific improvement areas with actionable advice]
  
  ═══════════════════════════════════════════════════════
  📚 RECOMMENDED LEARNING PATHS
  ═══════════════════════════════════════════════════════
  
  🎯 TECHNICAL SKILLS:
  • [Specific topic 1] - [Why important / Resource suggestion]
  • [Specific topic 2] - [Why important / Resource suggestion]
  • [Specific topic 3] - [Why important / Resource suggestion]
  
  🎯 COMMUNICATION SKILLS:
  • [Skill 1] - [Practical exercise suggestion]
  • [Skill 2] - [Practical exercise suggestion]
  
  ═══════════════════════════════════════════════════════
  🎬 ACTIONABLE NEXT STEPS
  ═══════════════════════════════════════════════════════
  
  BEFORE YOUR NEXT INTERVIEW:
  
  ✓ [Immediate action 1 - technical]
  ✓ [Immediate action 2 - technical]
  ✓ [Immediate action 3 - communication/soft skill]
  ✓ [Immediate action 4 - practice suggestion]
  
  ═══════════════════════════════════════════════════════
  🎯 FINAL ASSESSMENT
  ═══════════════════════════════════════════════════════
  
  CURRENT LEVEL: [Assessment of level]
  READINESS: [Honest assessment of interview readiness]
  
  30-DAY IMPROVEMENT PLAN:
  • Week 1: [Focus area]
  • Week 2: [Focus area]
  • Week 3: [Focus area]
  • Week 4: [Focus area]
  
  Keep improving! 🚀
  
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
