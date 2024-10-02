import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import store from "../stores/store.js";
import router from "../router/index.js";
import { message } from 'ant-design-vue';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Add an interceptor to include the token in the header for every request
api.interceptors.request.use((request) => {
  const token = localStorage.getItem("token"); // Assuming the token is stored in localStorage
  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }
  return request;
});

// Add an interceptor to handle errors
let hasShownSessionExpiredMessage = false; // To ensure the message is shown only once

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry && error.response.data.message === "ExpiredToken") {
      originalRequest._retry = true;
      console.log(originalRequest);
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_BASE_URL}/v1/auths/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = response.data.data.token;
        const newRefreshToken = response.data.data.refreshToken;

        localStorage.setItem("token", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        const decodedToken = jwtDecode(newAccessToken);
        store.commit('setUser', decodedToken.sub);
        store.commit('setLoginState', true);
        if (decodedToken.scope === 'ROLE_ADMIN') {
          store.commit('setAdmin', true);
        }
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        if(originalRequest.url === "/v1/auths/logout") {
          let data = originalRequest.data;
          let dataObj = JSON.parse(data);
          dataObj.token = newAccessToken;
          originalRequest.data = JSON.stringify(dataObj);
        }
        // Retry the failed request with the new token
        return axios(originalRequest);
      } catch (refreshError) {
        // Xóa local storage nếu refresh token không thành công
        localStorage.clear();
        sessionStorage.clear();
        store.commit('setUser', []);
        store.commit('setLoginState', false);
        store.commit('setAdmin', false);
        if (!hasShownSessionExpiredMessage) {
          setTimeout(() => {
            message.error("Phiên đăng nhập đã hết hạn!");
          }, 1000); // Only show once
          hasShownSessionExpiredMessage = true;
        }
        router.push("/login");
        reject("Phiên đăng nhập đã hết hạn");
      }
    } else if(error.response.data.message === "ExpiredToken" || error.response.data.message === "Unauthenticated") {
      localStorage.clear();
      sessionStorage.clear();
      store.commit('setUser', []);
      store.commit('setLoginState', false);
      store.commit('setAdmin', false);
      if (!hasShownSessionExpiredMessage) {
        setTimeout(() => {
          message.error("Phiên đăng nhập đã hết hạn!");
        }, 1000); // Only show once
        hasShownSessionExpiredMessage = true;
      }
      router.push("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
