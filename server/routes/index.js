const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const interviewControllers = require("../controllers/interviewController");
const authenticate = require("../middlewares/authentication");

// Auth routes
router.post("/register", authController.register);
router.post("/login", authController.login);

router.use(authenticate);

// Interview Session routes
router.post("/interviews", interviewControllers.startInterview);
router.post("/interviews/chat", interviewControllers.chatInterview);
router.post("/interviews/feedback", interviewControllers.submitFeedback);

module.exports = router;
