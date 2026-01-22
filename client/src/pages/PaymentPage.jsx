import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import api from "../api";
import { fetchCurrentUser } from "../store/slices/authSlice";

const PaymentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState(null);

  const handleUpgrade = async () => {
    setProcessing(true);
    setError(null);

    try {
      // 1. Get Snap Token from Backend
      const response = await api.post("/payment/initiate");
      const { token } = response.data;

      // 2. Open Snap Popup
      if (window.snap) {
        window.snap.pay(token, {
          onSuccess: function (result) {
            console.log("Payment success:", result);
            api
              .post("/payment/confirm", { orderId: result.order_id })
              .catch((err) => {
                console.error("Confirm payment failed", err);
              })
              .finally(async () => {
                try {
                  await dispatch(fetchCurrentUser());
                } catch (err) {
                  console.error("Failed to refresh user", err);
                }
                alert("Payment Successful! Welcome to the Elite Tier.");
                navigate("/dashboard");
              });
          },
          onPending: function (result) {
            console.log("Payment pending:", result);
            api
              .post("/payment/confirm", { orderId: result.order_id })
              .catch(() => {})
              .finally(async () => {
                try {
                  await dispatch(fetchCurrentUser());
                } catch (_) {}
                alert("Payment Pending. Please complete the transaction.");
                navigate("/dashboard");
              });
          },
          onError: function (result) {
            console.log("Payment error:", result);
            setError("Payment failed. Please try again.");
            setProcessing(false);
          },
          onClose: function () {
            console.log(
              "Customer closed the popup without finishing the payment",
            );
            setProcessing(false);
          },
        });
      } else {
        setError("Payment gateway not loaded. Please refresh the page.");
        setProcessing(false);
      }
    } catch (err) {
      console.error("Payment initiation failed", err);
      setError(
        err.response?.data?.message ||
          "Failed to initiate payment transaction.",
      );
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-retro-bg font-mono text-retro-text relative overflow-hidden flex flex-col">
      <div className="scanlines"></div>
      <Navbar />

      <div className="flex-grow container mx-auto px-4 py-10 max-w-4xl flex items-center justify-center">
        <div className="border-4 border-retro-pink bg-black/80 p-8 w-full max-w-2xl relative shadow-[0_0_20px_#ff2a9d]">
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-4 h-4 bg-retro-pink"></div>
          <div className="absolute top-0 right-0 w-4 h-4 bg-retro-pink"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 bg-retro-pink"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-retro-pink"></div>

          <h1 className="text-4xl font-pixel text-retro-pink text-center mb-2">
            ACCESS_DENIED
          </h1>
          <div className="text-center text-retro-pink/70 text-sm mb-8 tracking-widest uppercase">
            [FREE_TIER_LIMIT_REACHED]
          </div>

          <div className="space-y-6 text-center">
            <p className="text-white text-lg">
              You have exhausted your allocated simulation credits.
            </p>
            <p className="text-retro-cyan">
              Upgrade to <span className="font-bold">PRO_TIER</span> to unlock
              unlimited interview simulations and advanced analytics.
            </p>

            <div className="my-8 border-t border-b border-white/20 py-6">
              <div className="flex justify-between items-center px-10">
                <div className="text-left">
                  <div className="text-xs text-gray-400 uppercase">
                    Current Plan
                  </div>
                  <div className="text-xl text-gray-300">ROOKIE (Free)</div>
                </div>
                <div className="text-2xl text-white">→</div>
                <div className="text-right">
                  <div className="text-xs text-retro-yellow uppercase">
                    Target Plan
                  </div>
                  <div className="text-3xl font-pixel text-retro-yellow">
                    ELITE (Pro)
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-retro-pink/10 border border-retro-pink/50 p-4 mb-6">
              <ul className="text-left text-sm space-y-2 list-disc list-inside text-retro-text">
                <li>Unlimited AI Interview Sessions</li>
                <li>Detailed Performance Analytics</li>
                <li>Priority System Processing</li>
                <li>Access to "Extreme" Difficulty</li>
              </ul>
            </div>

            <Button
              onClick={handleUpgrade}
              disabled={processing}
              className="w-full py-4 text-lg shadow-neon-pink animate-pulse"
            >
              {processing
                ? "PROCESSING_TRANSACTION..."
                : "UPGRADE_NOW [ $9.99/mo ]"}
            </Button>

            <button
              onClick={() => navigate("/dashboard")}
              className="mt-4 text-xs text-gray-500 hover:text-white uppercase tracking-widest"
            >
              [RETURN_TO_BASE]
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 text-red-500 text-sm font-bold uppercase tracking-wide">
                ERROR: {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
