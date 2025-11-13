import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/hooks/apiClient";

export interface CreateTransactionDto {
  name: string;
  amount: number;
  categoryId: null;
  transactionTypeId: number;
  recurringFrequencyId: number;
  startDate: string;
}

export interface EditTransactionDto {
  id: string;
  name: string;
  amount: number;
  categoryId: null;
  transactionTypeId: number;
  recurringFrequencyId: number;
  nextRunAt: string;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  categoryId: string;
  type: { id: number; name: string };
  recurringFrequencyId: number;
  nextRunAt: string;
  isActive: boolean;
  currency?: { id: number; name: string };
}

interface TransactionState {
  autoTransaction: Transaction[];
  recurringFrequency: { id: number; name: string }[];
  loading: boolean;
  error: string | null;
}

export interface recurringFrequency {
  id: number;
  name: string;
}

const initialState: TransactionState = {
  autoTransaction: [],
  recurringFrequency: [],
  loading: false,
  error: null,
};

export const getAutoTransactions = createAsyncThunk<
  Transaction[],
  void,
  { rejectValue: string }
>("auto-transaction/getAutoTransactions", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get(
      "/RecurringRule/get-all-account-recurring_rules?PageSize=1000"
    );
    return data.data?.[0]?.items ?? [];
  } catch {
    return rejectWithValue("Ошибка сети");
  }
});

export const getRecurringFrequency = createAsyncThunk<
  { id: number; name: string }[],
  void,
  { rejectValue: string }
>("auto-transaction/getRecurringFrequency", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/Enum/get-recurring-frequency");
    return data.data?.[0] ?? [];
  } catch {
    return rejectWithValue("Ошибка сети");
  }
});

export const addAutoTransaction = createAsyncThunk<
  Transaction,
  CreateTransactionDto,
  { rejectValue: string }
>("auto-transaction/addAutoTransaction", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.post("/RecurringRule/create-recurring-rule", dto);
    return res.data.data;
  } catch {
    return rejectWithValue("Ошибка сети");
  }
});

export const editAutoTransaction = createAsyncThunk<
  Transaction,
  EditTransactionDto,
  { rejectValue: string }
>("auto-transaction/editAutoTransaction", async (dto, { rejectWithValue }) => {
  try {
    const res = await api.put("/RecurringRule/edit-recurring-rule", dto);
    return res.data.data?.[0]?.[0];
  } catch {
    return rejectWithValue("Ошибка редактирования транзакции");
  }
});

export const deleteAutoTransactions = createAsyncThunk<
  string[],
  string[],
  { rejectValue: string }
>(
  "auto-transaction/deleteAutoTransactions",
  async (ids, { rejectWithValue }) => {
    try {
      await api.delete("/RecurringRule/delete-recurring-rules", {
        data: { ids },
      });
      return ids;
    } catch {
      return rejectWithValue("Ошибка удаления транзакций");
    }
  }
);

export const filterAutoTransactions = createAsyncThunk<
  Transaction[],
  { Name?: string; AmountFrom?: number; AmountTo?: number },
  { rejectValue: string }
>(
  "auto-transaction/filterAutoTransactions",
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.Name) params.append("Name", filters.Name);
      if (filters.AmountFrom)
        params.append("AmountFrom", filters.AmountFrom.toString());
      if (filters.AmountTo)
        params.append("AmountTo", filters.AmountTo.toString());

      const res = await api.get(
        `/RecurringRule/get-all-account-recurring_rules?${params.toString()}`
      );
      return res.data.data?.[0]?.items ?? [];
    } catch {
      return rejectWithValue("Ошибка при фильтрации транзакций");
    }
  }
);

const autoTransactionSlice = createSlice({
  name: "auto-transaction",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAutoTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAutoTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.autoTransaction = action.payload;
      })
      .addCase(getAutoTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Неизвестная ошибка";
      })
      .addCase(getRecurringFrequency.fulfilled, (state, action) => {
        state.recurringFrequency = action.payload;
      })
      .addCase(addAutoTransaction.fulfilled, (state, action) => {
        state.autoTransaction.unshift(action.payload);
      })
      .addCase(editAutoTransaction.fulfilled, (state, action) => {
        const updated = action.payload;
        if (!updated) return;
        const idx = state.autoTransaction.findIndex((t) => t.id === updated.id);
        if (idx !== -1) state.autoTransaction[idx] = updated;
      })
      .addCase(deleteAutoTransactions.fulfilled, (state, action) => {
        state.autoTransaction = state.autoTransaction.filter(
          (t) => !action.payload.includes(t.id)
        );
      })
      .addCase(filterAutoTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.autoTransaction = action.payload;
      });
  },
});

export default autoTransactionSlice.reducer;
