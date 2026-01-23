import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../api";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Trophy,
  Star,
  FileText,
  MessageSquare,
  TrendingUp,
  Calendar,
  ArrowRight,
  Crown,
  X,
} from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState({ resumes: [], interviews: [] });
  const [activeTab, setActiveTab] = useState("resume");
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          api.get("/user/profile"),
          api.get("/user/history"),
        ]);
        setProfile(profileRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleResumeInterview = (interview) => {
    setSelectedInterview(interview);
  };

  const handleViewResume = (resume) => {
    setSelectedResume(resume);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-champion-dark text-champion-gold font-heading font-bold flex items-center justify-center animate-pulse">
        LOADING PROFILE DATA...
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen bg-champion-dark text-red-500 font-heading font-bold flex items-center justify-center">
        DATA CORRUPTED. RETRY LOGIN.
      </div>
    );

  const { user, stats, gamification } = profile;

  return (
    <div className="min-h-screen bg-champion-dark font-sans text-champion-text">
      <Navbar />

      <div className="container mx-auto px-6 pt-32 pb-12 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-champion-card border border-white/5 p-8 rounded-2xl relative overflow-hidden mb-8"
        >
          <div className="absolute top-0 right-0 flex gap-2 p-4 z-20">
            <div className="bg-champion-gold/10 text-champion-gold font-bold text-xs uppercase rounded-bl-xl tracking-widest flex items-center gap-2 px-3 py-2">
              <Trophy size={14} />
              Level: {gamification.tier}
            </div>
            {user.isPro && (
              <div className="bg-yellow-500/20 text-yellow-400 font-bold text-xs uppercase rounded-lg tracking-widest flex items-center gap-1 px-3 py-2">
                <Crown size={16} fill="currentColor" />
                PRO
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-heading font-bold shadow-lg shadow-indigo-500/20">
              {(user.username || "U").charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <h1 className="text-3xl font-heading font-bold text-white mb-1">
                {user.username}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 text-sm mb-6">
                <Mail size={14} />
                {user.email}
              </div>

              <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden mb-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${gamification.progress}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-gradient-gold h-full rounded-full"
                />
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-500">
                <span>Current XP</span>
                <span className="text-champion-gold">
                  Next Rank: {gamification.nextTier}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-champion-card border border-white/5 p-6 rounded-2xl flex items-center gap-4"
          >
            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <div className="text-3xl font-heading font-bold text-white">
                {stats.resumeCount}
              </div>
              <div className="text-xs uppercase tracking-widest text-gray-500">
                Resumes Scanned
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-champion-card border border-white/5 p-6 rounded-2xl flex items-center gap-4"
          >
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-lg">
              <MessageSquare size={24} />
            </div>
            <div>
              <div className="text-3xl font-heading font-bold text-white">
                {stats.interviewCount}
              </div>
              <div className="text-xs uppercase tracking-widest text-gray-500">
                Mock Interviews
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-champion-card border border-white/5 p-6 rounded-2xl flex items-center gap-4"
          >
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg">
              <Star size={24} />
            </div>
            <div>
              <div className="text-3xl font-heading font-bold text-white">
                {stats.avgScore}
              </div>
              <div className="text-xs uppercase tracking-widest text-gray-500">
                Avg Performance
              </div>
            </div>
          </motion.div>
        </div>

        {/* History Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-champion-card border border-white/5 rounded-2xl overflow-hidden"
        >
          <div className="flex border-b border-white/5">
            <button
              onClick={() => setActiveTab("resume")}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === "resume"
                  ? "bg-white/5 text-white border-b-2 border-champion-gold"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              Resume Logs
            </button>
            <button
              onClick={() => setActiveTab("interview")}
              className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-colors ${
                activeTab === "interview"
                  ? "bg-white/5 text-white border-b-2 border-champion-gold"
                  : "text-gray-500 hover:text-white hover:bg-white/5"
              }`}
            >
              Simulation Logs
            </button>
          </div>

          <div className="p-6">
            {activeTab === "resume" && (
              <div className="space-y-4">
                {history.resumes.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleViewResume(item)}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-champion-gold/50 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4 mb-2 md:mb-0">
                      champion-gold
                      <div className="p-2 bg-white/10 rounded-lg text-gray-400 group-hover:text-white transition-colors">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-white group-hover:text-champion-gold transition-colors">
                          Resume Analysis
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs uppercase text-gray-500">
                          Score
                        </div>
                        <div
                          className={`font-bold font-heading text-lg ${item.score >= 80 ? "text-green-400" : item.score >= 60 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {item.score}/100
                        </div>
                      </div>
                      <div className="p-2 rounded-full border border-white/10 group-hover:border-champion-gold/50 group-hover:bg-champion-gold/10 text-gray-400 group-hover:text-champion-gold transition-colors">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "interview" && (
              <div className="space-y-4">
                {history.interviews.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleResumeInterview(item)}
                    className="group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-champion-gold/50 hover:bg-white/10 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-4 mb-2 md:mb-0">
                      <div className="p-2 bg-white/10 rounded-lg text-gray-400 group-hover:text-champion-gold transition-colors">
                        <MessageSquare size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-white max-w-[200px] truncate group-hover:text-champion-gold transition-colors">
                          {item.role}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={10} />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-xs uppercase text-gray-500">
                          Score
                        </div>
                        <div
                          className={`font-bold font-heading text-lg ${item.score >= 80 ? "text-green-400" : item.score >= 60 ? "text-yellow-400" : "text-red-400"}`}
                        >
                          {item.score}/100
                        </div>
                      </div>
                      <div className="p-2 rounded-full border border-white/10 group-hover:border-champion-gold/50 group-hover:bg-champion-gold/10 text-gray-400 group-hover:text-champion-gold transition-colors">
                        <ArrowRight size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {((activeTab === "resume" && history.resumes.length === 0) ||
              (activeTab === "interview" &&
                history.interviews.length === 0)) && (
              <div className="text-center py-12 text-gray-500">
                <div className="mb-2 opacity-50">
                  <TrendingUp size={48} className="mx-auto" />
                </div>
                <p>No activity recorded yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Interview Detail Modal */}
        <AnimatePresence>
          {selectedInterview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedInterview(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-champion-card border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedInterview(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
                >
                  <X size={24} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-champion-gold/10 to-transparent p-8 border-b border-white/5">
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">
                    {selectedInterview.role}
                  </h2>
                  <div className="flex items-center gap-4 text-gray-400">
                    <Calendar size={16} />
                    {new Date(selectedInterview.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Score Section */}
                <div className="p-8">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 rounded-lg p-6 text-center border border-white/10">
                      <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                        Overall Score
                      </div>
                      <div
                        className={`text-4xl font-heading font-bold ${
                          selectedInterview.score >= 80
                            ? "text-green-400"
                            : selectedInterview.score >= 60
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {selectedInterview.score}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">/100</div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6 text-center border border-white/10">
                      <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                        Grade
                      </div>
                      <div className="text-4xl font-heading font-bold text-champion-gold">
                        {selectedInterview.score >= 90
                          ? "S"
                          : selectedInterview.score >= 80
                            ? "A"
                            : selectedInterview.score >= 70
                              ? "B"
                              : selectedInterview.score >= 60
                                ? "C"
                                : "D"}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {selectedInterview.score >= 90
                          ? "Excellent"
                          : selectedInterview.score >= 80
                            ? "Very Good"
                            : selectedInterview.score >= 70
                              ? "Good"
                              : selectedInterview.score >= 60
                                ? "Fair"
                                : "Needs Improvement"}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6 text-center border border-white/10">
                      <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                        Difficulty
                      </div>
                      <div className="text-2xl font-heading font-bold text-white">
                        {selectedInterview.difficulty || "Normal"}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Level</div>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-champion-gold font-bold uppercase tracking-widest text-sm mb-4">
                      Performance Feedback
                    </h3>
                    <div className="text-gray-300 space-y-3 leading-relaxed whitespace-pre-wrap text-sm">
                      {selectedInterview.feedback || "No feedback available"}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => {
                        setSelectedInterview(null);
                        localStorage.setItem(
                          "currentSessionId",
                          selectedInterview.id,
                        );
                        navigate("/interview");
                      }}
                      className="flex-1 bg-champion-gold text-black font-bold py-3 rounded-lg hover:bg-white transition-colors uppercase tracking-widest text-sm"
                    >
                      Review Session
                    </button>
                    <button
                      onClick={() => setSelectedInterview(null)}
                      className="flex-1 border border-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors uppercase tracking-widest text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Resume Detail Modal */}
        <AnimatePresence>
          {selectedResume && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedResume(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-champion-card border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedResume(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-10"
                >
                  <X size={24} />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-r from-champion-gold/10 to-transparent p-8 border-b border-white/5">
                  <h2 className="text-3xl font-heading font-bold text-white mb-2">
                    Resume Analysis
                  </h2>
                  <div className="flex items-center gap-4 text-gray-400">
                    <Calendar size={16} />
                    {new Date(selectedResume.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Score Section */}
                <div className="p-8">
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white/5 rounded-lg p-6 text-center border border-white/10">
                      <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                        Overall Score
                      </div>
                      <div
                        className={`text-4xl font-heading font-bold ${
                          selectedResume.score >= 80
                            ? "text-green-400"
                            : selectedResume.score >= 60
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {selectedResume.score}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">/100</div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6 text-center border border-white/10">
                      <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                        Grade
                      </div>
                      <div className="text-4xl font-heading font-bold text-champion-gold">
                        {selectedResume.score >= 90
                          ? "S"
                          : selectedResume.score >= 80
                            ? "A"
                            : selectedResume.score >= 70
                              ? "B"
                              : selectedResume.score >= 60
                                ? "C"
                                : "D"}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {selectedResume.score >= 90
                          ? "Excellent"
                          : selectedResume.score >= 80
                            ? "Very Good"
                            : selectedResume.score >= 70
                              ? "Good"
                              : selectedResume.score >= 60
                                ? "Fair"
                                : "Needs Improvement"}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-6 text-center border border-white/10">
                      <div className="text-gray-400 text-xs uppercase tracking-widest mb-2">
                        Type
                      </div>
                      <div className="text-2xl font-heading font-bold text-white">
                        <FileText size={24} className="mx-auto" />
                      </div>
                      <div className="text-xs text-gray-500 mt-2">Resume</div>
                    </div>
                  </div>

                  {/* Feedback Section */}
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                    <h3 className="text-champion-gold font-bold uppercase tracking-widest text-sm mb-4">
                      Analysis Feedback
                    </h3>
                    <div className="text-gray-300 space-y-3 leading-relaxed whitespace-pre-wrap text-sm">
                      {selectedResume.feedback || "No feedback available"}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-8">
                    {selectedResume.fileUrl && (
                      <a
                        href={selectedResume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-champion-gold text-black font-bold py-3 rounded-lg hover:bg-white transition-colors uppercase tracking-widest text-sm text-center"
                      >
                        View PDF
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedResume(null)}
                      className="flex-1 border border-white/10 text-white font-bold py-3 rounded-lg hover:bg-white/5 transition-colors uppercase tracking-widest text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfilePage;
