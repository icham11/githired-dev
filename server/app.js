const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const { sequelize } = require("./models");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://gethire.studio",
      "https://www.gethire.studio",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
const authRoutes = require("./routes/authRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const ttsRoutes = require("./routes/ttsRoutes");
const sttRoutes = require("./routes/sttRoutes");
const errorHandler = require("./middlewares/errorHandler");
require("./config/passport");

app.use("/auth", authRoutes);
app.use("/resume", resumeRoutes);
app.use("/interview", interviewRoutes);
app.use("/tts", ttsRoutes);
app.use("/stt", sttRoutes);
app.use("/user", require("./routes/userRoutes"));
app.use("/payment", require("./routes/paymentRoutes"));

app.use(errorHandler);

// Basic Route
app.get("/", (req, res) => {
  res.send("GitHired AI Server is running");
});

// Database Sync and Start Server
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully.");
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

module.exports = app;
