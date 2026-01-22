import React, { useState, useRef, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  startInterview,
  sendMessage,
  fetchSession,
  endInterview,
} from "../store/slices/interviewSlice";
import Navbar from "../components/Navbar";
import Button from "../components/Button";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  User,
  Bot,
  AlertCircle,
  Sparkles,
  X,
  Settings,
  Mic,
  StopCircle,
  Trophy,
} from "lucide-react";

const InterviewPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    sessionId,
    messages: rawMessages,
    loading,
    result,
    // error, // Removed unused error
    settings,
  } = useSelector((state) => state.interview);

  const messages = useMemo(() => rawMessages || [], [rawMessages]);
  const [step, setStep] = useState("setup");
  const [role, setRole] = useState("Frontend Developer");
  const [difficulty, setDifficulty] = useState("Normal");
  const [language, setLanguage] = useState("English");
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const uiText = {
    English: {
      missionReport: "PERFORMANCE DEBRIEF",
      scoreAnalysis: "Overall Score",
      debrief: "Examiner Notes:",
      reset: "Start New Simulation",
    },
    Indonesian: {
      missionReport: "LAPORAN PERFORMA",
      scoreAnalysis: "Skor Keseluruhan",
      debrief: "Catatan Penguji:",
      reset: "Mulai Simulasi Baru",
    },
  };

  const currentLang = settings?.language || "English";
  const text = uiText[currentLang] || uiText.English;

  useEffect(() => {
    const savedSessionId = localStorage.getItem("currentSessionId");
    if (savedSessionId && !sessionId) {
      dispatch(fetchSession(savedSessionId)).then((action) => {
        if (fetchSession.fulfilled.match(action)) {
          setStep("chat");
        } else {
          localStorage.removeItem("currentSessionId");
        }
      });
    }
  }, [dispatch, sessionId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleStartSession = async () => {
    const resultAction = await dispatch(
      startInterview({ role, difficulty, language }),
    );

    if (startInterview.fulfilled.match(resultAction)) {
      setStep("chat");
      if (resultAction.payload?.id) {
        localStorage.setItem("currentSessionId", resultAction.payload.id);
      }
    } else {
      const errorMessage = resultAction.payload || "";
      if (
        errorMessage.includes("Free Limit Reached") ||
        errorMessage.includes("Upgrade to Pro")
      ) {
        navigate("/payment");
      } else {
        alert("System Error: " + errorMessage);
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput("");
    await dispatch(sendMessage({ sessionId, message: userMessage }));
  };

  return (
    <div className="min-h-screen bg-champion-dark font-sans text-champion-text flex flex-col">
      <Navbar />

      <div className="flex-grow container mx-auto px-4 pt-20 pb-8 max-w-5xl h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {step === "setup" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto mt-10 bg-champion-card border border-white/5 p-8 md:p-12 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-gold" />
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-heading font-bold text-white mb-2">
                  Initialize Sim
                </h2>
                <p className="text-gray-400">
                  Configure your interview parameters.
                </p>
              </div>

              <div className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Target Role
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 text-white p-4 pr-10 focus:outline-none focus:border-champion-gold/50 transition-colors appearance-none"
                    >
                      <option>Frontend Developer</option>
                      <option>Backend Developer</option>
                      <option>Full Stack Developer</option>
                      <option>DevOps Engineer</option>
                      <option>Product Manager</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <Settings size={16} />
                    </div>
                  </div>
                </div>

                {/* Difficulty Selection */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Difficulty Protocol
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["Basic", "Normal", "Expert", "Extreme"].map((level) => (
                      <button
                        key={level}
                        onClick={() => setDifficulty(level)}
                        className={`p-4 border text-center transition-all duration-300 ${
                          difficulty === level
                            ? "border-champion-gold bg-champion-gold/10 text-champion-gold"
                            : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest text-gray-500 font-bold">
                    Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 text-white p-3 focus:outline-none focus:border-champion-gold/50 transition-colors"
                  >
                    <option>English</option>
                    <option>Indonesian</option>
                  </select>
                </div>

                <div className="pt-6">
                  <Button
                    onClick={handleStartSession}
                    disabled={loading}
                    variant="primary"
                    className="w-full py-4 text-lg"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2 animate-pulse">
                        Loading Assets...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Engage Simulation <Sparkles size={18} />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {step === "chat" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-champion-card border border-white/5 h-full flex flex-col relative overflow-hidden"
            >
              {/* Header */}
              <div className="bg-black/40 backdrop-blur-sm p-4 border-b border-white/5 flex justify-between items-center z-20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-white text-sm md:text-base">
                      {role}
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-champion-gold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online • {difficulty} Mode
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Abort current simulation? Progress will be lost.",
                      )
                    ) {
                      dispatch(endInterview(sessionId));
                    }
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-red-400"
                  title="End Session"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                    <Bot size={48} className="mb-4" />
                    <p>AI Interviewer connecting...</p>
                  </div>
                )}

                {messages.map((msg, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    key={index}
                    className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                        msg.role === "user"
                          ? "bg-white/10"
                          : "bg-gradient-to-br from-indigo-500 to-purple-600"
                      }`}
                    >
                      {msg.role === "user" ? (
                        <User size={14} />
                      ) : (
                        <Bot size={14} />
                      )}
                    </div>

                    <div
                      className={`max-w-[85%] md:max-w-[70%] p-4 md:p-6 rounded-2xl ${
                        msg.role === "user"
                          ? "bg-white/5 text-white rounded-tr-none border border-white/5"
                          : "bg-black/40 text-gray-300 rounded-tl-none border border-white/5"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed">
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Bot size={14} />
                    </div>
                    <div className="bg-black/40 p-4 rounded-2xl rounded-tl-none border border-white/5 flex items-center gap-2">
                      <span
                        className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 md:p-6 bg-black/40 border-t border-white/5 backdrop-blur-md">
                <form
                  onSubmit={handleSendMessage}
                  className="relative flex items-end gap-4 max-w-4xl mx-auto"
                >
                  {messages.filter((m) => m.role === "assistant").length >=
                  4 ? (
                    <Button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            "End session and generate report? This cannot be undone.",
                          )
                        ) {
                          dispatch(endInterview(sessionId));
                        }
                      }}
                      variant="danger"
                      className="py-4 px-6 h-[60px] rounded-xl flex items-center justify-center bg-red-500 hover:bg-red-600 text-white w-full"
                    >
                      <span className="mr-2 font-bold">
                        END SESSION & GET SCORE
                      </span>
                      <StopCircle size={20} />
                    </Button>
                  ) : (
                    <>
                      <div className="flex-1 relative">
                        <textarea
                          value={input}
                          onChange={(e) => setInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                          className="w-full bg-white/5 border border-white/10 text-white pl-4 pr-4 py-4 rounded-xl focus:outline-none focus:border-champion-gold/50 focus:bg-white/10 transition-all resize-none min-h-[60px] max-h-[120px]"
                          placeholder="Type your answer..."
                          disabled={loading}
                        />
                      </div>
                      <Button
                        type="button"
                        onClick={handleSendMessage}
                        disabled={loading || !input.trim()}
                        variant="primary"
                        className="py-4 px-6 h-[60px] rounded-xl flex items-center justify-center"
                      >
                        <Send size={20} />
                      </Button>
                    </>
                  )}
                </form>
                {/* Helper text only when input is visible */}
                {messages.filter((m) => m.role === "assistant").length < 4 && (
                  <div className="text-center mt-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                      Press Enter to Send • Shift + Enter for new line
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Overlay */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            >
              <div className="bg-champion-card border border-white/10 p-8 md:p-12 max-w-2xl w-full text-center relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-gold" />

                <div className="mb-6 flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-champion-gold/10 flex items-center justify-center text-champion-gold">
                    <Trophy size={40} />
                  </div>
                </div>

                <h2 className="text-4xl font-heading font-bold text-white mb-2">
                  {text.missionReport}
                </h2>
                <div className="w-24 h-1 bg-champion-gold mx-auto mb-8" />

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">
                      {text.scoreAnalysis}
                    </div>
                    <div className="text-5xl font-heading font-bold text-champion-gold">
                      {result.score}%
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-lg border border-white/5 flex flex-col justify-center items-center">
                    <div className="text-gray-400 text-xs uppercase tracking-widest mb-1">
                      Grade
                    </div>
                    <div className="text-3xl font-heading font-bold text-white">
                      {result.score >= 90
                        ? "S"
                        : result.score >= 80
                          ? "A"
                          : result.score >= 70
                            ? "B"
                            : "C"}
                    </div>
                  </div>
                </div>

                <div className="text-left bg-white/5 p-6 rounded-lg border border-white/5 mb-8 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/20">
                  <h4 className="text-champion-gold font-bold uppercase tracking-widest text-xs mb-3">
                    {text.debrief}
                  </h4>
                  <div className="text-gray-300 space-y-2 leading-relaxed whitespace-pre-wrap">
                    {result.feedback}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => {
                      localStorage.removeItem("currentSessionId");
                      window.location.reload();
                    }}
                    variant="primary"
                    className="w-full flex justify-center"
                  >
                    {text.reset}
                  </Button>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="outline"
                    className="w-full flex justify-center"
                  >
                    Return to Dashboard
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InterviewPage;
