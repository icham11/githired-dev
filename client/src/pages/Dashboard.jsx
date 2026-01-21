import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startInterview,
  sendMessage,
  clearInterview,
} from "../store/slices/interviewSlice";

import { useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [role, setRole] = useState("Frontend Developer");
  const [message, setMessage] = useState("");
  const [difficulty, setDifficulty] = useState("Junior");

  const { user } = useSelector((state) => state.auth);
  const { chatHistory, activeSession, loading } = useSelector(
    (state) => state.interview,
  );

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
    if (localStorage.getItem("token") === null) {
      navigate("/login");
    }
  }, [user, navigate]);
  const handleStartSession = () => {
    dispatch(startInterview({ role, difficulty }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;
    dispatch(
      sendMessage({ sessionId: activeSession.id, userMessage: message }),
    );
    setMessage("");
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearInterview());
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {!activeSession ? (
        <div className="bg-gray-800 p-8 rounded-lg text-center">
          <h2 className="text-xl mb-6">Start Interview Session</h2>
          <div className="flex gap-4 justify-center mb-6">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-gray-700  p-2 rounded"
            >
              <option>Frontend Developer</option>
              <option>Backend Developer</option>
              <option>Fullstack Developer</option>
              <option>Data Scientist</option>
            </select>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="bg-gray-700 p-2 rounded"
            >
              <option>Junior</option>
              <option>Mid-level</option>
              <option>Senior</option>
            </select>
          </div>
          <button
            onClick={handleStartSession}
            className="bg-blue-600 px-6 py-2 rounded font-bold hover:bg-blue-700"
          >
            {loading ? "Starting..." : "Start Interview 🚀"}
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 p-6 rounded-lg overflow-hidden h-[600px] flex flex-col ">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.length === 0 && (
              <div className="text-gray-500 text-center mt-10">
                No messages yet. Start the conversation!
              </div>
            )}
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    chat.role === "user"
                      ? "bg-blue-600 text-white rounded-tr-none"
                      : "bg-gray-700 text-gray-200 rounded-tl-none"
                  }`}
                >
                  {chat.content || chat.message}
                </div>
              </div>
            ))}
            {loading && (
              <div className="text-gray-400 text-sm animate-pulse">
                AI is thinking...
              </div>
            )}
          </div>
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-gray-900 flex border-t border-gray-700 gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 p-3 bg-gray-800 rounded outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              placeholder="Type your message..."
            />
            <button
              type="submit"
              className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading || message.trim() === ""}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <div className="text-center mt-6">
        <button onClick={handleLogout} className="text-red-500 hover:underline">
          Logout
        </button>
      </div>
    </div>
  );
}
