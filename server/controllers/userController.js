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
    let progress = (totalActivity / 20) * 100; // Bronze: 0-20 activities

    if (totalActivity >= 20) {
      tier = "Silver";
      nextTier = "Gold";
      progress = ((totalActivity - 20) / 40) * 100; // Silver: 20-60 activities
    }
    if (totalActivity >= 60) {
      tier = "Gold";
      nextTier = "Platinum";
      progress = ((totalActivity - 60) / 80) * 100; // Gold: 60-140 activities
    }
    if (totalActivity >= 140) {
      tier = "Platinum";
      nextTier = "Diamond";
      progress = ((totalActivity - 140) / 120) * 100; // Platinum: 140-260 activities
    }
    if (totalActivity >= 260) {
      tier = "Diamond";
      nextTier = "Champion";
      progress = ((totalActivity - 260) / 200) * 100; // Diamond: 260-460 activities
    }
    if (totalActivity >= 460) {
      tier = "Champion";
      nextTier = "Legend";
      progress = ((totalActivity - 460) / 300) * 100; // Champion: 460-760 activities
    }
    if (totalActivity >= 760) {
      tier = "Legend";
      nextTier = "Max";
      progress = ((totalActivity - 760) / 500) * 100; // Legend: 760+ activities
    }
    if (totalActivity >= 1260) {
      tier = "Max";
      nextTier = "Max";
      progress = 100; // Max: 1260+ activities
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
      attributes: ["id", "score", "fileUrl", "createdAt", "feedback", "feedback_en", "feedback_id"], // Include all feedback fields
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
