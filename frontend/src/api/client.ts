import axios from "axios";
import { auth } from "../firebase";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

// Inject Firebase ID token on every request (auto-refreshes if expired)
client.interceptors.request.use(async (config) => {
  const firebaseUser = auth.currentUser;
  if (firebaseUser) {
    const token = await firebaseUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, dispatch a global logout event
client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new CustomEvent("scrollar:logout"));
    }
    return Promise.reject(error);
  }
);

export default client;
