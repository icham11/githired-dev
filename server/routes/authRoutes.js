const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const {
  validateRegister,
  validateLogin,
} = require("../middlewares/validation");

router.post("/register", validateRegister, authController.register);
router.post("/login", validateLogin, authController.login);

// Google OAuth
const passport = require("passport");
const jwt = require("jsonwebtoken");

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login",
  }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { id: req.user.id, email: req.user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.redirect(`https://githired.web.app//oauth-success?token=${token}`);
  },
);

module.exports = router;
