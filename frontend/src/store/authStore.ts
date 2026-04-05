import { create } from "zustand";
import { authApi } from "../api/auth";
import type { User } from "../types";

const TOKEN_KEY = "scrollar_token";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  register: (data: { email: string; username: string; password: string }) => Promise<void>;
  login: (data: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  isLoading: false,
  error: null,

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.register(data);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      set({ user: res.user, token: res.access_token, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? "Registration failed";
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await authApi.login(data);
      localStorage.setItem(TOKEN_KEY, res.access_token);
      set({ user: res.user, token: res.access_token, isLoading: false });
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? "Login failed";
      set({ isLoading: false, error: msg });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, token: null });
  },

  loadFromStorage: async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    set({ isLoading: true });
    try {
      const user = await authApi.me();
      set({ user, token, isLoading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, token: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
