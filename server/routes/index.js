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
router.get("/interviews", interviewControllers.getHistory);
router.post("/interviews", interviewControllers.startInterview);
router.post("/interview/chat", interviewControllers.chatInterview);
router.post("/interview/feedback", interviewControllers.submitFeedback);

module.exports = router;
