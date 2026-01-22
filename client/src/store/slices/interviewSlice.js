import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

// Async Thunk to Start Interview
export const startInterview = createAsyncThunk(
  "interview/startInterview",
  async ({ role, difficulty, language }, { rejectWithValue }) => {
    try {
      const response = await api.post("/interview/start", {
        role,
        difficulty,
        language,
      });
      return response.data; // { id, role, difficulty, chatHistory... }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to start interview",
      );
    }
  },
);

// Async Thunk to Send Message
export const sendMessage = createAsyncThunk(
  "interview/sendMessage",
  async ({ sessionId, message }, { rejectWithValue }) => {
    try {
      const response = await api.post("/interview/chat", {
        sessionId,
        message,
      });
      return response.data; // { response: "AI feedback...", history: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send message",
      );
    }
  },
);

// Async Thunk to Fetch Session (Rehydration)
export const fetchSession = createAsyncThunk(
  "interview/fetchSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/interview/${sessionId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch session",
      );
    }
  },
);

// Async Thunk to End Interview
export const endInterview = createAsyncThunk(
  "interview/endInterview",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await api.post("/interview/end", { sessionId });
      return response.data; // { id, score, feedback, ... }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to end session",
      );
    }
  },
);

const interviewSlice = createSlice({
  name: "interview",
  initialState: {
    sessionId: null,
    messages: [], // Array of { role: 'user'|'assistant', content: string }
    loading: false,
    error: null,
    settings: { role: "", difficulty: "", language: "" },
    result: null, // { score, feedback }
  },
  reducers: {
    clearInterview: (state) => {
      state.sessionId = null;
      state.messages = [];
      state.error = null;
    },
    seedGreeting: (state, action) => {
      const content =
        action.payload || "Hello! Before we start, what should I call you?";
      state.messages.push({ role: "assistant", content });
    },
  },
  extraReducers: (builder) => {
    builder
      // Start Interview
      .addCase(startInterview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(startInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionId = action.payload.id;
        state.settings = {
          role: action.payload.role,
          difficulty: action.payload.difficulty,
          language: action.payload.language,
        };
        // Parse history if it comes as string
        let history = [];
        try {
          history =
            typeof action.payload.chatHistory === "string"
              ? JSON.parse(action.payload.chatHistory)
              : action.payload.chatHistory;
        } catch (error) {
          console.error("Failed to parse chat history:", error);
        }
        state.messages = history;
      })
      .addCase(startInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        // The thunk arg had the 'message' (user)
        const userMsg = action.meta.arg.message;
        const aiMsg = action.payload.response;
        const isCorrect = action.payload.isCorrect;

        state.messages.push({ role: "user", content: userMsg });
        state.messages.push({ role: "assistant", content: aiMsg, isCorrect });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Session
      .addCase(fetchSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchSession.fulfilled, (state, action) => {
        state.loading = false;
        state.sessionId = action.payload.id;
        state.settings = {
          role: action.payload.role,
          difficulty: action.payload.difficulty,
          language: action.payload.language,
        };
        let history = [];
        try {
          history =
            typeof action.payload.chatHistory === "string"
              ? JSON.parse(action.payload.chatHistory)
              : action.payload.chatHistory;
        } catch (error) {
          console.error("Failed to parse chat history:", error);
        }
        state.messages = history;
      })
      .addCase(fetchSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // End Interview
      .addCase(endInterview.pending, (state) => {
        state.loading = true;
      })
      .addCase(endInterview.fulfilled, (state, action) => {
        state.loading = false;
        state.result = {
          score: action.payload.score,
          feedback: action.payload.feedback,
          feedback_en: action.payload.feedback_en,
          feedback_id: action.payload.feedback_id,
        };
      })
      .addCase(endInterview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearInterview, seedGreeting } = interviewSlice.actions;
export default interviewSlice.reducer;
