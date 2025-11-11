import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/hooks/apiClient";

export interface CreateTransactionDto {
  name: string;
  amount: number;
  description: string;
  transactionTypeId: number;
  date: string;
  categoryId: null;
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  currency: { id: number; name: string };
  description: string | null;
  date: string;
  categoryId: null;
  categoryName?: string | null;
  type: { id: number; name: string };
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
    return data.data?.[0]?.items ?? [];
  } catch {
    return rejectWithValue("Ошибка сети");
  }
});

export const filterTransactions = createAsyncThunk<
  Transaction[],
  {
    Name?: string;
    AmountFrom?: number;
    AmountTo?: number;
    DateFrom?: string;
    DateTo?: string;
  },
  { rejectValue: string }
>("transaction/filterTransactions", async (filters, { rejectWithValue }) => {
  try {
    const params = new URLSearchParams();
    if (filters.Name) params.append("Name", filters.Name);
    if (filters.AmountFrom)
      params.append("AmountFrom", filters.AmountFrom.toString());
    if (filters.AmountTo)
      params.append("AmountTo", filters.AmountTo.toString());
    if (filters.DateFrom) params.append("DateFrom", filters.DateFrom);
    if (filters.DateTo) params.append("DateTo", filters.DateTo);

    const res = await api.get(
      `/Transaction/get-all-account-transactions?${params.toString()}`
    );

    return res.data.data?.[0]?.items ?? [];
  } catch {
    return rejectWithValue("Ошибка при фильтрации транзакций");
  }
});

export const deleteTransactions = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>("transaction/deleteTransactions", async (ids, { rejectWithValue }) => {
  try {
    await api.delete("/Transaction/delete-transactions", {
      data: { ids },
    });
    return ids;
  } catch {
    return rejectWithValue("Ошибка удаления транзакций");
  }
});

export const editTransaction = createAsyncThunk<
  Transaction,
  { id: string; name: string; categoryId: null; description: string },
  { rejectValue: string }
>("transaction/editTransaction", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.put("/Transaction/edit-transaction", dto);
    return res.data.data?.[0]?.[0];
  } catch {
    return rejectWithValue("Ошибка редактирования транзакции");
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
      })
      .addCase(deleteTransactions.fulfilled, (state, action) => {
        state.transactions = state.transactions.filter(
          (t) => !action.payload.includes(t.id)
        );
      })
      .addCase(filterTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(editTransaction.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;
        const idx = state.transactions.findIndex((t) => t.id === updated.id);
        if (idx !== -1) state.transactions[idx] = updated;
      });
  },
});

export default transactionSlice.reducer;
