import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "../../components/hooks/apiClient";

export interface MonthlySavings {
  month: string;
  income: number;
  expense: number;
  savings: number;
}

interface ReportsState {
  monthlyReports: MonthlyReport[];
  monthlySavings: MonthlySavings[];
  loadingReports: boolean;
  errorReports: string | null;
}

const initialState: ReportsState = {
  monthlyReports: [],
  monthlySavings: [],
  loadingReports: false,
  errorReports: null,
};

export interface MonthlyReport {
  month: string;
  totalIncomeAmount: number;
  totalExpenseAmount: number;
  totalIncomeTransactionCount: number;
  totalExpenseTransactionCount: number;
  totalTransactionCount: number;
}

export const fetchReports = createAsyncThunk<
  { monthlyReports: MonthlyReport[]; monthlySavings: MonthlySavings[] },
  void,
  { rejectValue: string }
>("reports/fetchReports", async (_, { rejectWithValue }) => {
  try {
    const [reportsRes, savingsRes] = await Promise.all([
      api.get("/Report/get-total-expenses-and-incomes-per-month"),
      api.get("/Report/get-monthly-savings"),
    ]);

    return {
      monthlyReports: reportsRes.data.data.flat(),
      monthlySavings: savingsRes.data.data.flat(),
    };
  } catch (err) {
    return rejectWithValue("Ошибка при загрузке отчетов");
  }
});

export const getMonthlyIncomeExpenses = createAsyncThunk<
  MonthlyReport[],
  void,
  { rejectValue: string }
>("reports/getMonthlyIncomeExpenses", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(
      "/Report/get-total-expenses-and-incomes-per-month"
    );
    return res.data.data.flat();
  } catch (err) {
    return rejectWithValue("Ошибка при получении отчётов по доходам/расходам");
  }
});

export const getMonthlySavings = createAsyncThunk<
  MonthlySavings[],
  void,
  { rejectValue: string }
>("reports/getMonthlySavings", async (_, { rejectWithValue }) => {
  try {
    const res = await api.get("/Report/get-monthly-savings");
    return res.data.data.flat();
  } catch (err) {
    return rejectWithValue("Ошибка при получении отчётов по накоплениям");
  }
});

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMonthlyIncomeExpenses.pending, (state) => {
        state.loadingReports = true;
        state.errorReports = null;
      })
      .addCase(getMonthlyIncomeExpenses.fulfilled, (state, action) => {
        state.loadingReports = false;
        state.monthlyReports = action.payload;
      })
      .addCase(getMonthlyIncomeExpenses.rejected, (state, action) => {
        state.loadingReports = false;
        state.errorReports = action.payload || "Неизвестная ошибка";
      })
      .addCase(getMonthlySavings.pending, (state) => {
        state.loadingReports = true;
        state.errorReports = null;
      })
      .addCase(getMonthlySavings.fulfilled, (state, action) => {
        state.loadingReports = false;
        state.monthlySavings = action.payload;
      })
      .addCase(getMonthlySavings.rejected, (state, action) => {
        state.loadingReports = false;
        state.errorReports = action.payload || "Неизвестная ошибка";
      })
      .addCase(fetchReports.pending, (state) => {
        state.loadingReports = true;
        state.errorReports = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loadingReports = false;
        state.monthlyReports = action.payload.monthlyReports;
        state.monthlySavings = action.payload.monthlySavings;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loadingReports = false;
        state.errorReports = action.payload || "Неизвестная ошибка";
      });
  },
});

export default reportsSlice.reducer;
