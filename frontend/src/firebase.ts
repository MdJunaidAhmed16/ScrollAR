import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "AIzaSyDgSfLU8vZoxkxVRaKSD-7iHGPv2YrXN0g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "scrollar-33651.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "scrollar-33651",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "scrollar-33651.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "770833228080",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:770833228080:web:16ceed48599e3a1889a8f5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
