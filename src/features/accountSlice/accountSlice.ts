import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://52.221.219.64/api/Account";
const ENUM_URL = "http://52.221.219.64/api/Enum/get-currency";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

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

interface AccountListResponse {
  statusCode: number;
  message: string;
  data: Account[][];
  errors: null;
}

interface CurrencyListResponse {
  statusCode: number;
  message: string;
  data: Currency[][];
  errors: null;
}

interface RootState {
  auth: {
    accessToken: string | null;
  };
}

interface AccountState {
  user: User | null;
  accounts: Account[];
  currentAccountId: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  user: null,
  accounts: [],
  currentAccountId: null,
  loading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk<
  Account[],
  void,
  { rejectValue: string }
>("account/fetchAccounts", async (_, { rejectWithValue, getState }) => {
  try {
    const accessToken = (getState() as RootState).auth.accessToken;

    const res = await axios.get<AccountListResponse>(
      `${API_URL}/get-user-accounts`,
      {
        headers: { Authorization: accessToken },
      }
    );
    return res.data.data[0] || [];
  } catch (error) {
    return rejectWithValue("Неизвестная ошибка");
  }
});

export const deleteAccount = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("account/deleteAccount", async (id, { rejectWithValue, getState }) => {
  try {
    const accessToken = (getState() as RootState).auth.accessToken;

    await axios.delete(`${API_URL}/delete-account`, {
      headers: { Authorization: accessToken },
      data: { id },
    });
    return id;
  } catch (error) {
    return rejectWithValue("Сетевая ошибка");
  }
});

export const getCurrency = createAsyncThunk<
  Currency[],
  void,
  { rejectValue: string }
>("account/getCurrency", async (_, { rejectWithValue, getState }) => {
  try {
    const accessToken = (getState() as RootState).auth.accessToken;

    const res = await axios.get<CurrencyListResponse>(ENUM_URL, {
      headers: { Authorization: accessToken },
    });
    return res.data.data[0] || [];
  } catch (error) {
    return rejectWithValue("Неизвестная ошибка");
  }
});

export const createAccount = createAsyncThunk<
  Account,
  { name: string; balance: number; currencyId: number; isDefault: boolean },
  { rejectValue: string }
>("account/createAccount", async (dto, { rejectWithValue, getState }) => {
  try {
    const accessToken = (getState() as RootState).auth.accessToken;

    const currencyRes = await axios.get<CurrencyListResponse>(ENUM_URL);
    const currencies = currencyRes.data.data[0] || [];
    const selectedCurrency = currencies.find(
      (c) => c.id === dto.currencyId
    ) || { id: dto.currencyId, name: "Unknown" };

    const res = await axios.post(`${API_URL}/create-account`, dto, {
      headers: { Authorization: accessToken },
    });

    const acc = res.data.data?.[0]?.[0];

    return {
      id: acc?.id || crypto.randomUUID(),
      name: acc?.name || dto.name,
      balance: acc?.balance ?? dto.balance,
      currency: acc?.currency || selectedCurrency,
      isDefault: acc?.isDefault ?? dto.isDefault,
      userId: acc?.userId || "",
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return rejectWithValue(error.response?.data?.message || "Ошибка сети");
    }
    return rejectWithValue("Ошибка сети");
  }
});

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    clearAccount: () => initialState,
    setCurrentAccount: (state, action) => {
      state.currentAccountId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.accounts = action.payload;
        if (action.payload.length > 0 && !state.currentAccountId) {
          state.currentAccountId = action.payload[0].id;
        }
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.accounts.push(action.payload);
        state.currentAccountId = action.payload.id;
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        const deletedId = action.payload;
        state.accounts = state.accounts.filter((acc) => acc.id !== deletedId);
        if (state.currentAccountId === deletedId) {
          state.currentAccountId = state.accounts[0]?.id || null;
        }
      });
  },
});

export const { clearAccount, setCurrentAccount } = accountSlice.actions;
export default accountSlice.reducer;
