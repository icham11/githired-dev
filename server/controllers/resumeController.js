// Ganti require-nya
const pdf = require("pdf-parse-fork"); // Atau "pdf-parse" jika kamu tidak mau ganti lib
const { ResumeAnalysis, User } = require("../models");
const { analyzeResume } = require("../services/aiService");
const { uploadToImageKit } = require("../utils/uploadUtils");

const analyze = async (req, res) => {
  try {
    // 1. Validasi User
    const user = await User.findByPk(req.user.id);
    if (!user.isPro) {
      return res.status(403).json({
        message: "This feature is for Pro users only. Please upgrade.",
      });
    }

    // 2. Validasi File
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { buffer, originalname } = req.file;

    // 3. Parse PDF (Logic Sederhana & Stabil)
    let resumeText = "";
    try {
      // Langsung panggil saja. Library ini didesain untuk handle buffer langsung.
      const data = await pdf(buffer);
      resumeText = data.text;

      // Validasi jika hasil kosong
      if (!resumeText || resumeText.trim().length === 0) {
        throw new Error("PDF text is empty");
      }
    } catch (parseError) {
      console.error("Error parsing PDF:", parseError);
      return res.status(400).json({
        message:
          "Gagal membaca PDF. Pastikan file tidak rusak atau dipassword.",
        error: parseError.message,
      });
    }

    // 4. Upload ke ImageKit (Opsional, dilakukan paralel biar cepat)
    // Kita biarkan upload jalan di background atau await jika memang butuh URL-nya disimpan
    let fileUrl = null;
    try {
      const uploadResult = await uploadToImageKit(buffer, originalname);
      fileUrl = uploadResult.url;
    } catch (err) {
      console.warn(
        "ImageKit upload failed, but continuing analysis:",
        err.message,
      );
    }

    // 5. AI Analysis
    const analysisResult = await analyzeResume(resumeText);

    // 6. Save to DB
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
    console.error("Resume Analysis Error:", error);
    res.status(500).json({
      message: "Terjadi kesalahan saat menganalisa resume.",
      error: error.message,
    });
  }
};

module.exports = { analyze };
