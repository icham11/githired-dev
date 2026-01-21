const sequelize = require("../config/database");
const User = require("./User");
const ResumeAnalysis = require("./ResumeAnalysis");
const InterviewSession = require("./InterviewSession");

const Transaction = require("./Transaction");

// Associations
User.hasMany(ResumeAnalysis, { foreignKey: "userId" });
ResumeAnalysis.belongsTo(User, { foreignKey: "userId" });

User.hasMany(InterviewSession, { foreignKey: "userId" });
InterviewSession.belongsTo(User, { foreignKey: "userId" });

User.hasMany(Transaction, { foreignKey: "userId" });
Transaction.belongsTo(User, { foreignKey: "userId" });

module.exports = {
  sequelize,
  User,
  ResumeAnalysis,
  InterviewSession,
  Transaction,
};
