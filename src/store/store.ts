import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/authSlice/authSlice";
import accountReducer from "../features/accountSlice/accountSlice";
import transactionReducer from "../features/transactionSlice/transactionSlice";
import { restoreTokens } from "../features/authSlice/authSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    account: accountReducer,
    transaction: transactionReducer,
  },
});

const accessToken = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");
if (accessToken && refreshToken) {
  store.dispatch(restoreTokens({ accessToken, refreshToken }));
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
