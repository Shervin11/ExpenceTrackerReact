import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/hooks/apiClient";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: Email;
  role: Role;
}

interface Email {
  address: string;
  isConfirmed: boolean;
}

interface Role {
  id: number;
  name: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

export const getUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>("user/getUser", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/User/get-user");
    return data.data[0];
  } catch (error) {
    return rejectWithValue("Неизвестная ошибка");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Неизвестная ошибка";
      });
  },
});

export default userSlice.reducer;
