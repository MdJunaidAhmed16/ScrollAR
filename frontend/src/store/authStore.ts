import {
  GoogleAuthProvider,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { create } from "zustand";
import { auth } from "../firebase";
import { authApi } from "../api/auth";
import type { User } from "../types";

const EMAIL_KEY = "scrollar_email_for_signin";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  init: () => () => void;          // sets up onAuthStateChanged, returns unsubscribe
  loginWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  completeMagicLink: () => Promise<boolean>; // returns true if sign-in completed
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  init: () => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        set({ isLoading: true });
        try {
          const user = await authApi.me();
          set({ user, isLoading: false });
        } catch {
          await signOut(auth);
          set({ user: null, isLoading: false });
        }
      } else {
        set({ user: null, isLoading: false });
      }
    });
    return unsubscribe;
  },

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      // onAuthStateChanged will fire and load the user
    } catch (err: any) {
      set({ isLoading: false, error: err.message ?? "Google sign-in failed" });
      throw err;
    }
  },

  sendMagicLink: async (email: string) => {
    set({ error: null });
    try {
      await sendSignInLinkToEmail(auth, email, {
        url: `${window.location.origin}/login`,
        handleCodeInApp: true,
      });
      localStorage.setItem(EMAIL_KEY, email);
    } catch (err: any) {
      set({ error: err.message ?? "Failed to send magic link" });
      throw err;
    }
  },

  completeMagicLink: async () => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return false;
    let email = localStorage.getItem(EMAIL_KEY);
    if (!email) {
      email = window.prompt("Please confirm your email address") ?? "";
    }
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem(EMAIL_KEY);
      // onAuthStateChanged will fire and load the user
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: err.message ?? "Magic link sign-in failed" });
      return false;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
