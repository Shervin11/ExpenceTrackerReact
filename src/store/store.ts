import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice/authSlice";
import accountReducer from "../features/accountSlice/accountSlice";
import userReducer from "../features/userSlice/userSlice";
import transactionReducer from "../features/transactionSlice/transactionSlice";
import { setStore } from "../components/hooks/apiClient";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    transaction: transactionReducer,
    user: userReducer,
  },
});

setStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
