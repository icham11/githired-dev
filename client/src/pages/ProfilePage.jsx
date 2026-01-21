import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import API from "../api";
import SubscriptionModal from "../components/SubscriptionModal";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState({ resumes: [], interviews: [] });
  const [activeTab, setActiveTab] = useState("resume");
  const [loading, setLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, historyRes] = await Promise.all([
          API.get("/user/profile"),
          API.get("/user/history"),
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

  if (loading)
    return (
      <div className="text-white text-center py-20">Loading profile...</div>
    );

  if (!profile)
    return (
      <div className="text-white text-center py-20">
        Failed to load profile.
        <br />
        <span className="text-red-400 text-sm">
          Possible reason: Server Error or Network Issue. <br />
          Try to Logout and Login again.
        </span>
      </div>
    );

  const { user, stats, gamification } = profile;

  // Tier Colors
  const tierColors = {
    Bronze: "from-orange-700 to-orange-400",
    Silver: "from-gray-400 to-gray-100",
    Gold: "from-yellow-600 to-yellow-300",
  };

  // Score Helpers
  const getScoreLabel = (score) => {
    if (!score && score !== 0) return "N/A";
    if (score >= 85) return "Exceptional";
    if (score >= 70) return "Good";
    if (score >= 50) return "Average";
    return "Needs Improvement";
  };

  const getScoreColor = (score) => {
    if (!score && score !== 0) return "text-zinc-500";
    if (score >= 85) return "text-purple-400";
    if (score >= 70) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <>
      <Navbar />
      {showUpgradeModal && (
        <SubscriptionModal
          onClose={() => setShowUpgradeModal(false)}
          onSuccess={() => {
            setShowUpgradeModal(false);
            window.location.reload(); // Simple reload to refresh data
          }}
        />
      )}
      <div className="container py-10 max-w-5xl text-white">
        {/* Header Profile */}
        <div className="glass-card p-8 rounded-3xl mb-10 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
          {/* Background Glow based on Tier */}
          <div
            className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-br ${tierColors[gamification.tier]} opacity-10 blur-[100px] rounded-full -z-10`}
          ></div>

          <div className="relative">
            <div
              className={`w-32 h-32 rounded-full bg-gradient-to-r ${tierColors[gamification.tier]} p-1`}
            >
              <div className="w-full h-full bg-zinc-900 rounded-full flex items-center justify-center text-4xl font-bold uppercase">
                {(user.name || "U").charAt(0)}
              </div>
            </div>
            {/* Badge */}
            <div
              className={`absolute -bottom-2 -right-2 bg-gradient-to-r ${tierColors[gamification.tier]} px-4 py-1 rounded-full text-black font-bold text-sm shadow-lg`}
            >
              {gamification.tier}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold">{user.name || "User"}</h1>
              {user.isPro ? (
                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                  PRO
                </span>
              ) : (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-xs px-3 py-1 rounded-full border border-amber-500/50 text-amber-500 transition-colors"
                >
                  Upgrade to Pro 👑
                </button>
              )}
            </div>
            <p className="text-zinc-400 mb-4">{user.email}</p>

            {/* Progress Bar */}
            <div className="bg-zinc-800 h-4 rounded-full overflow-hidden max-w-md w-full mx-auto md:mx-0 relative group">
              <div
                className={`h-full bg-gradient-to-r ${tierColors[gamification.tier]} transition-all duration-1000`}
                style={{ width: `${gamification.progress}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                {gamification.nextTier === "Max"
                  ? "MAX LEVEL"
                  : `NEXT: ${gamification.nextTier.toUpperCase()}`}
              </div>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Level Progress: {Math.round(gamification.progress)}%
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8 border-l border-white/10 pl-8 hidden md:flex">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-gold">
                {stats.resumeCount}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-widest">
                Resumes
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-gold">
                {stats.interviewCount}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-widest">
                Interviews
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient-gold">
                {stats.avgScore}
              </div>
              <div className="text-xs text-zinc-400 uppercase tracking-widest">
                Avg Score
              </div>
            </div>
          </div>
        </div>

        {/* Gamification & Readiness Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Hiring Readiness */}
          <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              🎯 Hiring Readiness
            </h3>
            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold border-4 ${
                  stats.avgScore >= 80
                    ? "border-green-500 text-green-400 bg-green-500/10"
                    : "border-amber-500 text-amber-500 bg-amber-500/10"
                }`}
              >
                {stats.avgScore}
              </div>
              <div>
                <div
                  className={`text-xl font-bold ${stats.avgScore >= 80 ? "text-green-400" : "text-amber-500"}`}
                >
                  {stats.avgScore >= 80
                    ? "Ready to Hire! 🚀"
                    : "Developing Talent 🌱"}
                </div>
                <p className="text-zinc-400 text-xs">
                  {stats.avgScore >= 80
                    ? "Great job! Your average score is very strong. You are ready for real interviews."
                    : "Keep practicing! Aim for an average score of 80+ across resumes and interviews."}
                </p>
              </div>
            </div>
          </div>

          {/* Badge Legend */}
          <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              🏆 Membership Tiers
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-700 to-orange-400 flex items-center justify-center text-xs font-bold ring-1 ring-white/20">
                  B
                </div>
                <div>
                  <div className="text-sm font-bold text-orange-400">
                    Bronze
                  </div>
                  <div className="text-xs text-zinc-500">
                    Starter Level (0-4 Activities)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-100 flex items-center justify-center text-xs font-bold text-black ring-1 ring-white/20">
                  S
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-300">Silver</div>
                  <div className="text-xs text-zinc-500">
                    Active User (5-14 Activities)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-300 flex items-center justify-center text-xs font-bold text-black ring-1 ring-white/20">
                  G
                </div>
                <div>
                  <div className="text-sm font-bold text-yellow-400">Gold</div>
                  <div className="text-xs text-zinc-500">
                    Master Level (15+ Activities)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Tabs */}
        <div className="flex gap-6 mb-6 border-b border-white/10 pb-1">
          <button
            onClick={() => setActiveTab("resume")}
            className={`pb-3 px-2 text-lg font-medium transition-all ${
              activeTab === "resume"
                ? "text-amber-400 border-b-2 border-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Resume Analysis
          </button>
          <button
            onClick={() => setActiveTab("interview")}
            className={`pb-3 px-2 text-lg font-medium transition-all ${
              activeTab === "interview"
                ? "text-amber-400 border-b-2 border-amber-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Mock Interviews
          </button>
        </div>

        {/* List Content */}
        <div className="grid gap-4">
          {activeTab === "resume" ? (
            history.resumes.length === 0 ? (
              <p className="text-zinc-500 italic">
                No resume analysis history found.
              </p>
            ) : (
              history.resumes.map((item) => (
                <div
                  key={item.id}
                  className="glass-card p-6 rounded-xl hover:bg-zinc-800/50 transition-colors flex justify-between items-center group"
                >
                  <div>
                    <div className="text-sm text-zinc-400 mb-1">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="font-bold text-lg flex items-center gap-2">
                      <span className="text-2xl">📄</span> Score:{" "}
                      <span
                        className={
                          item.score >= 80 ? "text-green-400" : "text-amber-400"
                        }
                      >
                        {item.score}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.fileUrl && (
                      <a
                        href={item.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm text-amber-500 hover:underline mr-4"
                      >
                        View PDF
                      </a>
                    )}
                  </div>
                </div>
              ))
            )
          ) : history.interviews.length === 0 ? (
            <p className="text-zinc-500 italic">No interview history found.</p>
          ) : (
            history.interviews.map((item) => (
              <div
                key={item.id}
                className="glass-card p-6 rounded-xl hover:bg-zinc-800/50 transition-colors flex justify-between items-center"
              >
                <div>
                  <div className="text-sm text-zinc-400 mb-1">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                  <div className="font-bold text-lg mb-1">{item.role}</div>
                  <div className="text-sm flex items-center gap-2">
                    <span className="text-zinc-400">Score:</span>
                    <span className={`font-bold ${getScoreColor(item.score)}`}>
                      {item.score || "N/A"}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${getScoreColor(
                        item.score,
                      )} border-current bg-opacity-10`}
                    >
                      {getScoreLabel(item.score)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
