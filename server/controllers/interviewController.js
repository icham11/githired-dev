const { InterviewSession } = require("../models");
const aiService = require("../services/aiService");

// Create a new interview session
exports.startInterview = async (req, res) => {
  try {
    const { role, difficulty } = req.body;
    const session = await InterviewSession.create({
      userId: req.user.id,
      role,
      difficulty,
      chatHistory: "[]",
    });
    res.status(201).json({ message: "Interview session created", session });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error starting session", error: error.message });
  }
};

// Handle chat messages during the interview
exports.chatInterview = async (req, res) => {
  try {
    const { sessionId, userMessage } = req.body;
    const session = await InterviewSession.findByPk(sessionId);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Update chat history
    let chatHistory = JSON.parse(session.chatHistory);
    chatHistory.push({ role: "user", content: userMessage });
    const aiResponse = await aiService.generateInterviewResponse(
      chatHistory,
      session.role,
    );
    chatHistory.push({ role: "assistant", content: aiResponse.message });

    // Save updated chat history
    session.chatHistory = JSON.stringify(chatHistory);
    await session.save();
    res.json({
      message: "Message processed",
      aiResponse,
      history: chatHistory,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing message", error: error.message });
  }
};

// Submit feedback and score for the interview session
exports.submitFeedback = async (req, res) => {
  try {
    const { sessionId, score, feedback } = req.body;
    const session = await InterviewSession.findByPk(sessionId);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({ message: "Session not found" });
    }
    session.score = score;
    session.feedback = feedback;
    await session.save();
    res.json({ message: "Feedback submitted", session });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error submitting feedback", error: error.message });
  }
};
