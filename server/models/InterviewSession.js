const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class InterviewSession extends Model {}

  InterviewSession.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.STRING,
        defaultValue: "Junior",
      },
      language: {
        type: DataTypes.STRING,
        defaultValue: "English",
      },
      chatHistory: {
        type: DataTypes.TEXT,
        defaultValue: "[]",
      },
      score: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "InterviewSession",
    },
  );

  return InterviewSession;
};
