const { DataTypes, Model } = require("sequelize");

module.exports = (sequelize) => {
  class ResumeAnalysis extends Model {}

  ResumeAnalysis.init(
    {
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      score: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      feedback_en: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      feedback_id: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      fileUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ResumeAnalysis",
    },
  );

  return ResumeAnalysis;
};
