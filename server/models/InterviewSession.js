const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const InterviewSession = sequelize.define("InterviewSession", {
  role: {
    type: DataTypes.STRING,
    defaultValue: "General Software Engineer",
  },
  difficulty: {
    type: DataTypes.STRING, // 'Normal', 'Expert', 'Extreme'
    defaultValue: "Normal",
  },
  chatHistory: {
    type: DataTypes.TEXT, // Stored as JSON string
    defaultValue: "[]",
  },
  language: {
    type: DataTypes.STRING, // 'English', 'Indonesian'
    defaultValue: "English",
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  feedback: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  feedback_en: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  feedback_id: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = InterviewSession;
