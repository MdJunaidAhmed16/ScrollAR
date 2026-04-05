import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDgSfLU8vZoxkxVRaKSD-7iHGPv2YrXN0g",
  authDomain: "scrollar-33651.firebaseapp.com",
  projectId: "scrollar-33651",
  storageBucket: "scrollar-33651.firebasestorage.app",
  messagingSenderId: "770833228080",
  appId: "1:770833228080:web:16ceed48599e3a1889a8f5",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
