import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

// --- Async Thunks ---

// 1. Start Interview
export const startSession = createAsyncThunk(
  "interview/start",
  async ({ role, difficulty }, { rejectWithValue }) => {
    try {
      const response = await api.post("/interviews", { role, difficulty });
      return response.data; // Mengembalikan object session
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  },
);

// 2. Kirim Chat
export const sendChat = createAsyncThunk(
  "interview/chat",
  async ({ sessionId, userMessage }, { rejectWithValue }) => {
    try {
      const response = await api.post("/interviews/chat", {
        sessionId,
        userMessage,
      });
      return response.data; // { aiResponse, history }
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  },
);

const initialState = {
  activeSession: null, // Sesi yang sedang berlangsung
  chatHistory: [], // Array chat untuk ditampilkan di layar
  loading: false,
  error: null,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    clearSession: (state) => {
      state.activeSession = null;
      state.chatHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Start Session
      .addCase(startSession.pending, (state) => {
        state.loading = true;
      })
      .addCase(startSession.fulfilled, (state, action) => {
        state.loading = false;
        state.activeSession = action.payload; // Simpan data sesi
        state.chatHistory = []; // Reset chat
      })
      // Send Chat
      .addCase(sendChat.pending, (state) => {
        // Note: Kita bisa bikin logic "optimistic UI" di sini nanti
        state.loading = true;
      })
      .addCase(sendChat.fulfilled, (state, action) => {
        state.loading = false;
        // Update history dengan respon terbaru dari server
        state.chatHistory = action.payload.history;

        // Update score kalau ada di masa depan
        // state.activeSession.score = action.payload.score;
      })
      .addCase(sendChat.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSession } = interviewSlice.actions;
export default interviewSlice.reducer;
