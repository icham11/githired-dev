const express = require("express");
const router = express.Router();
const multer = require("multer");
const resumeController = require("../controllers/resumeController");
const authenticateToken = require("../middlewares/auth");

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

router.post(
  "/analyze",
  authenticateToken,
  upload.single("resume"),
  resumeController.analyze,
);

module.exports = router;
