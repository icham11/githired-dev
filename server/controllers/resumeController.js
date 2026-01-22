const pdf = require("pdf-parse");
const { ResumeAnalysis, User } = require("../models");
const { analyzeResume } = require("../services/aiService");
const { uploadToImageKit } = require("../utils/uploadUtils");

const analyze = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user.isPro) {
      return res.status(403).json({
        message: "This feature is for Pro users only. Please upgrade.",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { buffer, originalname } = req.file;

    // 1. Upload to ImageKit (async, don't block analysis if not strictly needed, but let's await it for data integrity)
    // We wrap it in a try-catch so analysis can proceed even if upload fails (optional strategy, but consistent with "Scanner")
    let fileUrl = null;
    try {
      const uploadResult = await uploadToImageKit(buffer, originalname);
      fileUrl = uploadResult.url;
    } catch (uploadError) {
      console.error("ImageKit Upload Failed:", uploadError);
      // Continue with analysis, just won't have a URL
    }

    // 2. Parse Text from Buffer
    let resumeText = "";
    try {
      if (typeof pdf !== "function") {
        console.error("PDF Parser is not a function:", typeof pdf, pdf);
        throw new Error("PDF Parser configuration error");
      }
      const data = await pdf(buffer);
      resumeText = data.text;
    } catch (parseError) {
      console.error("Error parsing PDF:", parseError);
      return res.status(400).json({
        message: "Invalid PDF file structure. Please upload a valid PDF.",
      });
    }

    // 3. AI Analysis
    const analysisResult = await analyzeResume(resumeText);

    // 4. Save to DB
    const resumeAnalysis = await ResumeAnalysis.create({
      userId: req.user.id,
      content: resumeText,
      score: analysisResult.score,
      feedback: analysisResult.feedback, // Default
      feedback_en: analysisResult.feedback_en,
      feedback_id: analysisResult.feedback_id,
      fileUrl: fileUrl,
    });

    res.json(resumeAnalysis);
  } catch (error) {
    console.error("Resume Analysis Error:", error.message);
    res.status(500).json({
      message: "Error analyzing resume",
    });
  }
};

module.exports = { analyze };
