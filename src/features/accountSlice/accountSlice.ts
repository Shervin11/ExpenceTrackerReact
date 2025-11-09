import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://52.221.219.64/api/Account";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserResponse {
  statusCode: number;
  message: string;
  data: User;
  errors: null;
}

interface AccountState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  user: null,
  loading: false,
  error: null,
};

export const fetchAccount = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("account/fetchAccount", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<UserResponse>(`${API_URL}/profile`);
    return response.data.data;
  } catch (err) {
    return rejectWithValue("Ошибка сети");
  }
});

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    clearAccount: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccount.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Неизвестная ошибка";
      });
  },
});

export const { clearAccount } = accountSlice.actions;
export default accountSlice.reducer;
