const midtransClient = require("midtrans-client");
const { Transaction, User } = require("../models");
const crypto = require("crypto");

// Create Snap API instance
// Create Snap API instance
const snap = new midtransClient.Snap({
  isProduction: false, // User explicitly requested Sandbox
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const initiatePayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);

    // Create unique order ID
    const orderId = `ORDER-${userId}-${Date.now()}`;
    const amount = 50000; // IDR 50.000 for Pro

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: user.name || user.username || "User",
        email: user.email,
      },
      item_details: [
        {
          id: "PRO_SUBSCRIPTION",
          price: amount,
          quantity: 1,
          name: "CareerForge Pro Subscription",
        },
      ],
      enabled_payments: [
        "credit_card",
        "gopay",
        "bca_va",
        "bni_va",
        "bri_va",
        "other_qris",
      ],
    };

    const transaction = await snap.createTransaction(parameter);

    // Save pending transaction
    await Transaction.create({
      orderId,
      amount,
      status: "pending",
      snapToken: transaction.token,
      userId,
    });

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (error) {
    next(error);
  }
};

const handleNotification = async (req, res, next) => {
  try {
    const statusResponse = req.body;
    const orderId = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;

    const transaction = await Transaction.findOne({ where: { orderId } });
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    let newStatus = "pending";

    if (transactionStatus == "capture") {
      if (fraudStatus == "challenge") {
        newStatus = "challenge";
      } else if (fraudStatus == "accept") {
        newStatus = "success";
      }
    } else if (transactionStatus == "settlement") {
      newStatus = "success";
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      newStatus = "failed";
    } else if (transactionStatus == "pending") {
      newStatus = "pending";
    }

    // Update Transaction
    transaction.status = newStatus;
    await transaction.save();

    // If success, upgrade User
    if (newStatus === "success") {
      const user = await User.findByPk(transaction.userId);
      if (user) {
        user.isPro = true;
        await user.save();
      }
    }

    res.status(200).send("OK");
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initiatePayment,
  handleNotification,
};
