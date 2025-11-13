import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./app/style/index.css";
import App from "./app/App.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store.ts";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <StrictMode>
      <App />
    </StrictMode>
  </Provider>
);
