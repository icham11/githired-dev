const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const authenticateToken = require("../middlewares/auth");

router.post("/start", authenticateToken, interviewController.startSession);
router.post("/chat", authenticateToken, interviewController.chat);
router.post("/end", authenticateToken, interviewController.endSession);
router.get("/:sessionId", authenticateToken, interviewController.getSession);

module.exports = router;
