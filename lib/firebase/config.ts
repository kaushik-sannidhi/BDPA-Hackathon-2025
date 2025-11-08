import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD8DuLKbtPgwhmWZAvmndcMBdHUoJy6gZw",
  authDomain: "bdpa-3b97e.firebaseapp.com",
  databaseURL: "https://bdpa-3b97e-default-rtdb.firebaseio.com",
  projectId: "bdpa-3b97e",
  storageBucket: "bdpa-3b97e.firebasestorage.app",
  messagingSenderId: "1080259608855",
  appId: "1:1080259608855:web:937cd7f341ecb74d59f752",
  measurementId: "G-NTZ74E2H76"
};

// Initialize Firebase
let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

if (typeof window !== "undefined") {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
}

// Export with fallbacks for SSR safety
export { auth, db };
export default app;

