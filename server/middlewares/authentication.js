const jwt = require("jsonwebtoken");
const { User } = require("../models");

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log("🚀 ~ authenticate ~ error:", error);
    if (
      error.name === "Unauthenticated" ||
      error.name === "JsonWebTokenError"
    ) {
      res
        .status(401)
        .json({ message: "Invalid or expired token, please login again" });
    } else {
      res
        .status(500)
        .json({ message: "Internal server error", error: error.message });
    }
  }
};
module.exports = authenticate;
