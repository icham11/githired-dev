const { ResumeAnalysis, User } = require("../models");
const { analyzeResume } = require("../services/aiService");
const { uploadImageKit } = require("../utils/uploadUtils");
const pdf = require("pdf-parse");

const analyze = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user.isPro) {
      return res.status(403).json({
        message:
          "This feature is available for Pro users only. Please upgrade.",
      });
    }
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { buffer, originalname } = req.file;

    let fileUrl = null;
    try {
      const uploadResult = await uploadImageKit(buffer, originalname);
      console.log("🚀 ~ analyze ~ uploadResult:", uploadResult);

      fileUrl = uploadResult.url;
    } catch (uploadError) {
      console.error("Error uploading to ImageKit:", uploadError);
      return res.status(500).json({ message: "Error uploading file" });
    }

    let resumeText = "";
    try {
      const data = await pdf(buffer);
      resumeText = data.text;
    } catch (pdfError) {
      console.error("Error parsing PDF:", pdfError);
      return res.status(400).json({ message: "Error parsing PDF file" });
    }

    const analysisResult = await analyzeResume(resumeText);

    const resumeAnalysis = await ResumeAnalysis.create({
      userId: req.user.id,
      content: resumeText,
      score: analysisResult.score,
      feedback: analysisResult.feedback,
      feedback_en: analysisResult.feedback_en,
      feedback_id: analysisResult.feedback_id,
      fileUrl: fileUrl,
    });
    res.json(resumeAnalysis);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error analyzing resume" });
  }
};

module.exports = {
  analyze,
};
