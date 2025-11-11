import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/hooks/apiClient";

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
>("transaction/getTransactions", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/Transaction/get-all-account-transactions");

    return data.data[0].items;
  } catch (err) {
    return rejectWithValue("Ошибка сети");
  }
});

export const addTransaction = createAsyncThunk<
  Transaction,
  CreateTransactionDto,
  { rejectValue: string }
>("transaction/addTransaction", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.post("/Transaction/create-transaction", dto);
    return res.data.data;
  } catch (err) {
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
