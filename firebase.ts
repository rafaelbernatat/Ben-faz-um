import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {
  // Mantém funcionamento mesmo se a persistência falhar no browser atual.
});

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

const LEGACY_DATABASE_URL = "https://ben-faz-1-default-rtdb.firebaseio.com";

export const getDatabaseRestUrl = (idToken?: string) => {
  const baseUrl =
    (import.meta.env.VITE_FIREBASE_DATABASE_URL as string | undefined) ||
    LEGACY_DATABASE_URL;
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const url = `${normalizedBaseUrl}/eventData.json`;

  if (!idToken) return url;
  return `${url}?auth=${encodeURIComponent(idToken)}`;
};
