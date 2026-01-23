import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
import api from "../api";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Smartphone,
} from "lucide-react";

const ResumePage = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [analysisLang, setAnalysisLang] = useState("en");

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("language", analysisLang);

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Analysis Failed. Please try again.";

      if (err.response?.status === 403) {
        if (window.confirm(errorMessage + "\n\nClick OK to upgrade to Pro.")) {
          window.location.href = "/payment";
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-champion-dark font-sans text-champion-text">
      <Navbar />

      <div className="container mx-auto px-6 pt-32 pb-12 max-w-4xl">
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-heading font-bold text-white mb-4"
          >
            RESUME <span className="text-champion-gold">SCANNER</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-lg mx-auto"
          >
            Optimize your CV for Applicant Tracking Systems (ATS) with our
            AI-powered analysis engine.
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-champion-card border border-white/5 p-8 md:p-12 rounded-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-32 bg-champion-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

              <div className="relative z-10 flex flex-col items-center justify-center border-2 border-dashed border-white/10 p-12 hover:border-champion-gold/30 hover:bg-white/5 transition-all duration-300 rounded-xl group">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="cursor-pointer w-full flex flex-col items-center"
                >
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-champion-gold/10 transition-all duration-300">
                    {file ? (
                      <FileText size={40} className="text-champion-gold" />
                    ) : (
                      <UploadCloud
                        size={40}
                        className="text-gray-400 group-hover:text-champion-gold transition-colors"
                      />
                    )}
                  </div>

                  <h3 className="text-xl font-heading font-bold text-white mb-2">
                    {file ? file.name : "Drop your PDF here or click to upload"}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 uppercase tracking-widest">
                    MAX FILE SIZE: 5MB
                  </p>
                </label>

                {file && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 mt-4"
                  >
                    <button
                      onClick={() => setAnalysisLang("en")}
                      className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                        analysisLang === "en"
                          ? "bg-white text-black"
                          : "bg-white/5 text-gray-500 hover:bg-white/10"
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => setAnalysisLang("id")}
                      className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                        analysisLang === "id"
                          ? "bg-white text-black"
                          : "bg-white/5 text-gray-500 hover:bg-white/10"
                      }`}
                    >
                      Indonesian
                    </button>
                  </motion.div>
                )}
              </div>

              <div className="mt-8 max-w-xs mx-auto">
                <Button
                  onClick={handleUpload}
                  disabled={loading || !file}
                  className="w-full"
                  variant="primary"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="animate-spin" size={16} />{" "}
                      Processing...
                    </span>
                  ) : (
                    "Analyze Resume"
                  )}
                </Button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 flex items-center justify-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-lg border border-red-500/20"
                >
                  <AlertCircle size={18} />
                  <span className="text-sm font-bold">{error}</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <Button
                variant="outline"
                onClick={() => setResult(null)}
                className="mb-4"
              >
                ← Scan Another Resume
              </Button>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-champion-card border border-white/5 p-8 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-champion-gold/5 to-transparent" />
                  <div className="relative z-10">
                    <h3 className="text-gray-400 text-xs uppercase tracking-widest mb-4">
                      ATS Compatibility Score
                    </h3>
                    <div className="text-7xl font-heading font-bold text-white mb-2">
                      {result.score}
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${result.score}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className={`h-full ${result.score >= 80 ? "bg-green-500" : result.score >= 60 ? "bg-yellow-500" : "bg-red-500"}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 bg-champion-card border border-white/5 p-8 rounded-2xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-white/5 rounded-lg text-champion-gold">
                      <CheckCircle size={24} />
                    </div>
                    <h3 className="text-xl font-heading font-bold text-white">
                      Analysis Report
                    </h3>
                  </div>

                  <div className="text-gray-300 space-y-2 leading-relaxed whitespace-pre-wrap text-sm font-mono overflow-x-auto max-w-none">
                    {analysisLang === "id"
                      ? result.feedback_id ||
                        "Terjemahan data tidak ditemukan dalam database."
                      : result.feedback_en || result.feedback}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ResumePage;
