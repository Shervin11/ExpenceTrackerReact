import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice/authSlice";
import accountReducer from "../features/accountSlice/accountSlice";
import userReducer from "../features/userSlice/userSlice";
import transactionReducer from "../features/transactionSlice/transactionSlice";
import { setStore } from "../components/hooks/apiClient";
import autoTransactionReducer from "../features/autoTransactionSlice/autoTransactionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    transaction: transactionReducer,
    user: userReducer,
    autoTransaction: autoTransactionReducer,
  },
});

setStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
