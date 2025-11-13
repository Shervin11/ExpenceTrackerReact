import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import Register from "../page/register/register";
import Login from "../page/login/login";
import Home from "../page/home/home";
import Transaction from "../page/transaction/transaction";
import AutoTransaction from "../page/autoTransaction/autoTransaction";
import { ProtectedLayout } from "../components/ProtectedLayout/ProtectedLayout";

const App = () => {
  const token = useSelector((state: RootState) => state.auth.accessToken);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      dispatch({ type: "auth/restoreToken", payload: savedToken });
    }
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/home"
          element={
            token ? (
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/transactions"
          element={
            token ? (
              <ProtectedLayout>
                <Transaction />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/auto-transaction"
          element={
            token ? (
              <ProtectedLayout>
                <AutoTransaction />
              </ProtectedLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            token ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
