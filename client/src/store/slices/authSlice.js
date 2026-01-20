import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api";

// 1. Async Thunk: Fungsi yang bisa request API
export const loginUser = createAsyncThunk(
  "auth/login", // Nama aksi (bebas)
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", formData);
      const { token, user } = response.data;

      // Simpan di LocalStorage biar kalau refresh gak hilang loginnya
      localStorage.setItem("token", token);

      // Return data biar masuk ke Redux State
      return user;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  },
);

// 2. Initial State (Kondisi Awal)
const initialState = {
  user: null, // Belum login
  loading: false, // Sedang loading?
  error: null, // Ada error?
};

// 3. Slice (Potongan Logika)
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Aksi sinkron (tanpa API)
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
    },
    // Buat restore user kalau refresh halaman (bisa kita tambah nanti)
    setUser: (state, action) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Menangani status dari loginUser (Pending, Fulfilled, Rejected)
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // Data user dari return thunk masuk sini
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Pesan error masuk sini
      });
  },
});

export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post("/register", formData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  },
);

// Tambahkan extraReducers untuk registerUser
authSlice.extraReducers = (builder) => {
  builder
    .addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    })
    .addCase(registerUser.fulfilled, (state) => {
      state.loading = false;
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
};

export const { logout, setUser } = authSlice.actions;
export default authSlice.reducer;
