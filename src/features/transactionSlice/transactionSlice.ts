import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = "http://52.221.219.64/api/Transaction";

export interface CreateTransactionDto {
  name: string;
  amount: number;
  currencyId: number;
  description: string;
  transactionTypeId: number;
  date: string;
  categoryId: string;
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  currencyId: number;
  description: string;
  transactionTypeId: number;
  date: string;
  categoryId: string;
}

interface TransactionResponse {
  statusCode: number;
  message: string;
  data: Transaction;
  errors: null | unknown;
}

interface TransactionListResponse {
  statusCode: number;
  message: string;
  data: Transaction[];
  errors: null | unknown;
}

interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

export const getTransactions = createAsyncThunk<
  Transaction[],
  void,
  { rejectValue: string }
>("transaction/getTransactions", async (_, { rejectWithValue, getState }) => {
  try {
    const accessToken = (getState() as any).auth.accessToken;
    const res = await axios.get<TransactionListResponse>(`${API_URL}/get-all`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        err.response?.data?.message || "Не удалось загрузить транзакции"
      );
    }
    return rejectWithValue("Ошибка сети");
  }
});

export const addTransaction = createAsyncThunk<
  Transaction,
  CreateTransactionDto,
  { rejectValue: string }
>("transaction/addTransaction", async (dto, { rejectWithValue, getState }) => {
  try {
    const accessToken = (getState() as any).auth.accessToken;
    const res = await axios.post<TransactionResponse>(
      `${API_URL}/create`,
      dto,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return res.data.data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      return rejectWithValue(
        err.response?.data?.message || "Не удалось добавить транзакцию"
      );
    }
    return rejectWithValue("Ошибка сети");
  }
});

const transactionSlice = createSlice({
  name: "transaction",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(getTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Неизвестная ошибка";
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
      });
  },
});

export default transactionSlice.reducer;
