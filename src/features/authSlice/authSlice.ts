import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "https://tracker-api.ddns.net/api/Auth/";

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

export const registerUser = createAsyncThunk<
  TokenData,
  { firstName: string; lastName: string; email: string; password: string },
  { rejectValue: string }
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
  { email: string; password: string },
  { rejectValue: string }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const res = await axios.post<AuthResponse>(`${API_URL}login`, credentials);
    return res.data.data[0];
  } catch (err) {
    return rejectWithValue("Ошибка авторизации");
  }
});

export const refreshAuth = createAsyncThunk<
  { accessToken: string; refreshToken: string },
  void,
  { rejectValue: string }
>("auth/refreshAuth", async (_, { rejectWithValue }) => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return rejectWithValue("Нет refreshToken");
  }

  try {
    const res = await axios.post<{ data: TokenData[] }>(
      "http://52.221.219.64/api/Auth/refresh",
      { refreshToken }
    );
    const newTokens = res.data.data?.[0];
    if (!newTokens) {
      throw new Error("Нет новых токенов");
    }
    return newTokens;
  } catch (err) {
    return rejectWithValue("Не удалось обновить сессию");
  }
});

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isRefreshing: boolean;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  isRefreshing: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    restoreTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("refreshToken", action.payload.refreshToken);
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.isRefreshing = false;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
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
      })
      .addCase(refreshAuth.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(refreshAuth.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isRefreshing = false;
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      })
      .addCase(refreshAuth.rejected, (state) => {
        state.isRefreshing = false;
      });
  },
});

export const { restoreTokens, logout } = authSlice.actions;
export default authSlice.reducer;
