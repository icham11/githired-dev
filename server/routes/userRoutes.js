const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");

router.get("/profile", auth, userController.getProfile);
router.get("/history", auth, userController.getHistory);

module.exports = router;
