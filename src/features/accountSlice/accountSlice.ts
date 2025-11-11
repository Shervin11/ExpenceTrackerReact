import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../components/hooks/apiClient";

export interface Currency {
  id: number;
  name: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: Currency;
  isDefault: boolean;
  userId: string;
}

interface RootState {
  auth: { accessToken: string | null };
}

interface AccountState {
  accounts: Account[];
  currentAccountId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  accounts: [],
  currentAccountId: null,
  loading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk<
  Account[],
  void,
  { rejectValue: string }
>("account/fetchAccounts", async (_, { getState, rejectWithValue }) => {
  try {
    const token = (getState() as RootState).auth.accessToken;
    if (!token) return rejectWithValue("Нет токена");

    const res = await api.get(`/Account/get-user-accounts`);
    const accounts = res.data.data?.[0] || [];
    return accounts.filter((a: any): a is Account => !!a && !!a.id);
  } catch {
    return rejectWithValue("Ошибка загрузки счетов");
  }
});

export const createAccount = createAsyncThunk<
  Account,
  { name: string; balance: number; currencyId: number; isDefault: boolean },
  { rejectValue: string }
>("account/createAccount", async (dto, { getState, rejectWithValue }) => {
  try {
    const token = (getState() as RootState).auth.accessToken;
    if (!token) return rejectWithValue("Нет токена");

    const res = await api.post(`Account/create-account`, dto);
    const acc = res.data.data?.[0]?.[0];

    return acc;
  } catch {
    return rejectWithValue("Ошибка создания счёта");
  }
});

export const editAccount = createAsyncThunk<
  Account,
  { id: string; name: string; isDefault: boolean },
  { rejectValue: string }
>("account/editAccount", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.put(`/Account/edit-account`, dto);
    const acc = res.data.data?.[0]?.[0];
    return acc;
  } catch {
    return rejectWithValue("Ошибка обновления счёта");
  }
});

export const deleteAccount = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("account/deleteAccount", async (id, { getState, rejectWithValue }) => {
  try {
    const token = (getState() as RootState).auth.accessToken;
    if (!token) return rejectWithValue("Нет токена");
    await api.delete(`/Account/delete-account`, { data: { id } });
    return id;
  } catch {
    return rejectWithValue("Ошибка удаления");
  }
});

export const getCurrency = createAsyncThunk<
  Currency[],
  void,
  { rejectValue: string }
>("account/getCurrency", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("Enum/get-currency");
    return res.data.data?.[0] || [];
  } catch {
    return rejectWithValue("Ошибка загрузки валют");
  }
});

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    clearAccount: () => initialState,
    setCurrentAccount: (state, action: PayloadAction<string>) => {
      state.currentAccountId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.accounts = action.payload;
        if (!state.currentAccountId && action.payload.length)
          state.currentAccountId = action.payload[0].id;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
      })
      .addCase(editAccount.fulfilled, (state, action) => {
        if (!action.payload || !action.payload.id) return;
        const idx = state.accounts.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.accounts[idx] = action.payload;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        state.accounts = state.accounts.filter((a) => a.id !== action.payload);
      });
  },
});

export const { clearAccount, setCurrentAccount } = accountSlice.actions;
export default accountSlice.reducer;
