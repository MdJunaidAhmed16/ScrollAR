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

// Map Firebase error codes to human-readable messages
function friendlyError(err: any): string {
  const code: string = err?.code ?? "";
  const map: Record<string, string> = {
    "auth/popup-closed-by-user":       "Sign-in window was closed. Please try again.",
    "auth/popup-blocked":              "Your browser blocked the sign-in popup. Please allow popups for this site.",
    "auth/cancelled-popup-request":    "Sign-in cancelled. Please try again.",
    "auth/network-request-failed":     "Network error — check your connection and try again.",
    "auth/too-many-requests":          "Too many attempts. Please wait a few minutes and try again.",
    "auth/user-disabled":              "This account has been disabled. Contact support if you think this is a mistake.",
    "auth/invalid-email":              "That doesn't look like a valid email address.",
    "auth/invalid-action-code":        "This magic link has expired or already been used. Request a new one.",
    "auth/expired-action-code":        "This magic link has expired. Request a new one.",
    "auth/unauthorized-domain":        "Sign-in is not allowed from this domain. Please use the official app URL.",
    "auth/operation-not-allowed":      "This sign-in method is not enabled. Contact the app owner.",
    "auth/internal-error":             "An unexpected error occurred. Please try again.",
    "auth/user-not-found":             "No account found with this email.",
    "auth/account-exists-with-different-credential":
      "An account already exists with this email using a different sign-in method. Try signing in with Google instead.",
  };
  return map[code] ?? err?.message ?? "Something went wrong. Please try again.";
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  init: () => () => void;
  loginWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  completeMagicLink: () => Promise<boolean>;
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
          set({ user: null, isLoading: false, error: "Failed to load your account. Please sign in again." });
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
    } catch (err: any) {
      set({ isLoading: false, error: friendlyError(err) });
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
      set({ error: friendlyError(err) });
      throw err;
    }
  },

  completeMagicLink: async () => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return false;
    let email = localStorage.getItem(EMAIL_KEY);
    if (!email) {
      email = window.prompt("Please confirm your email address to complete sign-in:") ?? "";
    }
    if (!email) {
      set({ error: "Email address is required to complete sign-in." });
      return false;
    }
    set({ isLoading: true, error: null });
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      localStorage.removeItem(EMAIL_KEY);
      return true;
    } catch (err: any) {
      set({ isLoading: false, error: friendlyError(err) });
      return false;
    }
  },

  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },

  clearError: () => set({ error: null }),
}));
