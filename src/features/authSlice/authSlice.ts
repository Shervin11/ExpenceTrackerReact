import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://52.221.219.64/api/Auth/";

interface TokenData {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  statusCode: number;
  message: string;
  data: TokenData[];
  errors: null;
}

interface AuthState {
  accessToken: string;
  refreshToken: string;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem("accessToken") || "",
  refreshToken: localStorage.getItem("refreshToken") || "",
};

export const registerUser = createAsyncThunk<
  TokenData,
  { firstName: string; lastName: string; email: string; password: string }
>("auth/register", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post<AuthResponse>(`${API_URL}register`, data);
    return res.data.data[0];
  } catch (err) {
    return rejectWithValue("Ошибка регистрации");
  }
});

export const loginUser = createAsyncThunk<
  TokenData,
  { email: string; password: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await axios.post<AuthResponse>(`${API_URL}login`, credentials);
    return res.data.data[0];
  } catch (err) {
    return rejectWithValue("Ошибка авторизации");
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.accessToken = "";
      state.refreshToken = "";
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },
    restoreTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      });
  },
});

export const { logout, restoreTokens } = authSlice.actions;
export default authSlice.reducer;
