const { User, ResumeAnalysis, InterviewSession } = require("../models");

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "username", "email", "role", "isPro", "createdAt"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate Tier based on activity count
    const resumeCount = await ResumeAnalysis.count({
      where: { userId: user.id },
    });
    const interviewCount = await InterviewSession.count({
      where: { userId: user.id },
    });
    const totalActivity = resumeCount + interviewCount;

    let tier = "Bronze";
    let nextTier = "Silver";
    let progress = (totalActivity / 5) * 100;

    if (totalActivity >= 5) {
      tier = "Silver";
      nextTier = "Gold";
      progress = ((totalActivity - 5) / 10) * 100;
    }
    if (totalActivity >= 15) {
      tier = "Gold";
      nextTier = "Max";
      progress = 100;
    }

    // Calculate Average Score
    const resumeSum = await ResumeAnalysis.sum("score", {
      where: { userId: user.id },
    });
    const interviewSum = await InterviewSession.sum("score", {
      where: { userId: user.id },
    });

    // Safety check for null sums (if no records)
    const validResumeSum = resumeSum || 0;
    const validInterviewSum = interviewSum || 0;

    // Only count activities with scores? Actually tier counts all activities.
    // For average, we should divide by total count.
    const avgScore =
      totalActivity > 0
        ? Math.round((validResumeSum + validInterviewSum) / totalActivity)
        : 0;

    res.json({
      user,
      stats: {
        resumeCount,
        interviewCount,
        totalActivity,
        avgScore,
      },
      gamification: {
        tier,
        nextTier,
        progress: Math.min(progress, 100),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const resumes = await ResumeAnalysis.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "score", "fileUrl", "createdAt", "feedback"], // Lite attributes
    });

    const interviews = await InterviewSession.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
      attributes: ["id", "role", "score", "createdAt", "feedback"],
    });

    res.json({
      resumes,
      interviews,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  getHistory,
};
