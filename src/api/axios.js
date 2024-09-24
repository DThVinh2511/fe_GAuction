import axios from "axios";
import { jwtDecode } from 'jwt-decode';
import store from "../stores/store.js";
import router from "../router/index.js";


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
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle error here
    console.error("An error occurred:", error.response.data.message);
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry && error.response.data.message === "ExpiredToken") {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('token');
        const response = await axios.post(`${API_BASE_URL}/v1/auths/refresh`, {
          token: refreshToken,
        });

        const newAccessToken = response.data.data.token;
        localStorage.setItem("token", newAccessToken);
        const decodedToken = jwtDecode(newAccessToken);
        store.commit('setUser', decodedToken.sub);
        store.commit('setLoginState', true);
        const scope = decodedToken.scope;
        if (scope === 'ROLE_ADMIN') {
          store.commit('setAdmin', true);
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        console.log("Error", refreshError);
        localStorage.clear();
        sessionStorage.clear();
        store.commit('setUser', []);
        store.commit('setLoginState', false);
        store.commit('setAdmin', false);
        console.log("Error");
        router.push("/login");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
