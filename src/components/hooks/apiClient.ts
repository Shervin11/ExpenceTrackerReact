import axios from "axios";
import { restoreTokens } from "../../features/authSlice/authSlice";

let store: any = null;
export const setStore = (s: any) => {
  store = s;
};

const api = axios.create({
  baseURL: "https://tracker-api.ddns.net/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token");
    }

    const res = await axios.post(
      "http://52.221.219.64/api/Auth/refresh-token",
      refreshToken,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const newAccessToken = res.data.data?.[0]?.accessToken;
    const newRefreshToken = res.data.data?.[0]?.refreshToken;

    if (newAccessToken && store) {
      store.dispatch(
        restoreTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        })
      );
      originalRequest.headers.Authorization = newAccessToken;
      return api(originalRequest);
    }
  }
);

export default api;
