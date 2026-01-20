const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./models");
const PORT = process.env.PORT || 3001;

const router = require("./routes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

// Test route
app.get("/", (req, res) => {
  res.send("GitHired Server is Running 🚀");
});

db.sequelize
  .sync({ force: false, alter: true })
  .then(() => {
    console.log("Database synchronized successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error synchronizing database:", err);
  });

module.exports = app;
