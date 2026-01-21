const { InterviewSession, User } = require("../models");
const {
  generateInterviewResponse,
  evaluateInterview,
} = require("../services/aiService");

const startSession = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    // Feature Gate: Free users max 1 session
    if (!user.isPro) {
      const sessionCount = await InterviewSession.count({
        where: { userId: user.id },
      });
      if (sessionCount >= 1) {
        // Limit to 1
        return res.status(403).json({
          message:
            "Free Limit Reached. Max 1 Interview Session. Upgrade to Pro for unlimited access.",
        });
      }
    }

    const { role, difficulty, language } = req.body;
    const session = await InterviewSession.create({
      userId: req.user.id,
      role: role || "General Software Engineer",
      difficulty: difficulty || "Normal",
      language: language || "English",
      chatHistory: "[]", // Initialize empty array
    });

    res.status(201).json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error starting session" });
  }
};

const chat = async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    const session = await InterviewSession.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let history = JSON.parse(session.chatHistory);

    // Add user message
    history.push({ role: "user", content: message });

    // 4. Get AI Response
    const aiResponse = await generateInterviewResponse(
      history,
      session.role,
      session.difficulty,
      session.language,
    );

    const aiResponseText =
      aiResponse.message || "Sorry, I could not generate a response."; // Fallback

    // 5. Save User Message & AI Response to DB History
    // Store structure: { role: 'assistant', content: message, isCorrect: boolean }
    history.push({
      role: "assistant",
      content: aiResponseText,
      isCorrect: aiResponse.isCorrect,
    });

    // Update DB
    session.chatHistory = JSON.stringify(history);
    await session.save();

    res.json({
      response: aiResponseText,
      isCorrect: aiResponse.isCorrect,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error in chat" });
  }
};

const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching session" });
  }
};

const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await InterviewSession.findByPk(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Parse history to send to AI
    const history = JSON.parse(session.chatHistory);

    // Evaluate
    const evaluation = await evaluateInterview(history, session.role);

    // Save
    session.score = evaluation.score;
    session.feedback = evaluation.feedback;
    await session.save();

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error ending session" });
  }
};

module.exports = { startSession, chat, getSession, endSession };
