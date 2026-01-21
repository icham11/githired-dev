// Contoh logika yang benar (Production Ready)

const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Wajib untuk Heroku
    },
  },
});
module.exports = sequelize;
