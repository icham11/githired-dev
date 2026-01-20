const Sequelize = require("sequelize");
const config = require("../config/database.js");

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const db = {};

let sequelize;
if (dbConfig.use_env_variable) {
  sequelize = new Sequelize(process.env[dbConfig.use_env_variable], dbConfig);
} else {
  sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    dbConfig,
  );
}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./User")(sequelize);
db.InterviewSession = require("./InterviewSession")(sequelize);

// Define associations
db.User.hasMany(db.InterviewSession, { foreignKey: "userId" });
db.InterviewSession.belongsTo(db.User, { foreignKey: "userId" });

module.exports = db;
