const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middlewares/auth");

router.post("/initiate", auth, paymentController.initiatePayment);
router.post("/notification", paymentController.handleNotification);

module.exports = router;
