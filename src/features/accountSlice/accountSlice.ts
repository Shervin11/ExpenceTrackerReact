import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import api from "../../components/hooks/apiClient";

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
    if (!accessToken) {
      return rejectWithValue("Токен отсутствует");
    }
    const res = await api.get<AccountListResponse>(
      `/Account/get-user-accounts`
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
    if (!accessToken) {
      return rejectWithValue("Токен отсутствует");
    }
    await api.delete(`/Account/delete-account`, { data: { id } });
    return id;
  } catch (error) {
    return rejectWithValue("Сетевая ошибка");
  }
});

export const getCurrency = createAsyncThunk<
  Currency[],
  void,
  { rejectValue: string }
>("account/getCurrency", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get<CurrencyListResponse>("Enum/get-currency");
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
    if (!accessToken) {
      return rejectWithValue("Токен отсутствует");
    }

    const res = await api.post(`Account/create-account`, dto);

    const acc = res.data.data?.[0]?.[0];
    const currency = acc?.currency || { id: dto.currencyId, name: "Unknown" };

    return {
      id: acc?.id || crypto.randomUUID(),
      name: acc?.name || dto.name,
      balance: acc?.balance ?? dto.balance,
      currency,
      isDefault: acc?.isDefault ?? dto.isDefault,
      userId: acc?.userId || "",
    };
  } catch (error) {
    return rejectWithValue("Ошибка сети");
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
