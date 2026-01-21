import { useState } from "react";
import api from "../api";

const SubscriptionModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      if (!window.snap) {
        alert(
          "Payment System is ensuring secure connection. Please try again later.",
        );
        setLoading(false);
        return;
      }

      const { data } = await api.post("/payment/initiate");

      window.snap.pay(data.token, {
        onSuccess: async () => {
          alert("Payment successful! You are now a Pro member.");
          if (onSuccess) onSuccess();
          onClose();
        },
        onPending: () => {
          alert("Payment is pending. Please complete the payment to upgrade.");
          onClose();
        },
        onError: () => {
          alert("Payment failed! Please try again.");
          setLoading(false);
        },
        onClose: () => {
          alert("You closed the payment popup without completing the payment.");
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Initiate payment failed:", error);
      alert("Failed to initiate payment. Please try again later.");
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl relative border-amber-500/50 border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
        >
          ✕
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-full mx-auto flex items-center justify-center text-3xl mb-4 shadow-lg shadow-amber-500/20">
            👑
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Pro</h2>
          <p className="text-zinc-400">Unlock user limitless potential</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3 text-zinc-300">
            <span className="text-green-400">✓</span>
            <span>Unlimited Resume Analysis</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <span className="text-green-400">✓</span>
            <span>Unlimited Mock Interview Sessions</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <span className="text-green-400">✓</span>
            <span>Priority AI Processing</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-300">
            <span className="text-green-400">✓</span>
            <span>Exclusive Gold Profile Badge</span>
          </div>
        </div>

        <div className="text-center mb-6">
          <span className="text-3xl font-bold text-white">IDR 50.000</span>
          <span className="text-zinc-500"> / lifetime</span>
        </div>

        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-black font-bold py-4 rounded-xl transition-all transform hover:scale-[1.02] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : "Upgrade Now"}
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModal;
