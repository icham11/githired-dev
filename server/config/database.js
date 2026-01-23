const { Sequelize } = require("sequelize");

let sequelize;

// Use lightweight in-memory DB for tests to avoid external dependencies/SSL issues
if (process.env.NODE_ENV === "test") {
  sequelize = new Sequelize("sqlite::memory:", {
    logging: false,
  });
} else {
  // Production / development database config
  const useSSL = process.env.DATABASE_SSL === "true";

  sequelize = new Sequelize(
    process.env.DATABASE_URL ||
      "postgres://postgres:postgres@localhost:5432/career_forge",
    {
      dialect: "postgres",
      logging: false,
      dialectOptions: useSSL
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false, // important for Railway/Heroku
            },
          }
        : {},
    },
  );
}

module.exports = sequelize;
