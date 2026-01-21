const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ResumeAnalysis = sequelize.define("ResumeAnalysis", {
  content: {
    type: DataTypes.TEXT, // Extracted text from PDF
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
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
  feedback: {
    type: DataTypes.TEXT, // Kept for legacy/default
    allowNull: true,
  },
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

module.exports = ResumeAnalysis;
