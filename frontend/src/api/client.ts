import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "/api",
  headers: { "Content-Type": "application/json" },
});

// Inject JWT on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("scrollar_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, dispatch a global logout event (avoids circular import with store)
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
