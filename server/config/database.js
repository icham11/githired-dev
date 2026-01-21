const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_URL ||
    "postgres://postgres:postgres@localhost:5432/career_forge",
  {
    dialect: "postgres",
    logging: false,
    dialectOptions: process.env.DATABASE_URL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false, // Penting untuk Railway/Heroku
          },
        }
      : {},
  },
);

module.exports = sequelize;
