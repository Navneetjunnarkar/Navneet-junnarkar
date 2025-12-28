import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const getEnv = (key: string, defaultVal: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env && (process.env as any)[key]) {
      return (process.env as any)[key] as string;
    }
  } catch (e) {}
  return defaultVal;
};

const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY', "YOUR_API_KEY_HERE"),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN', "your-app-id.firebaseapp.com"),
  projectId: getEnv('FIREBASE_PROJECT_ID', "your-app-id"),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET', "your-app-id.appspot.com"),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID', "123456789"),
  appId: getEnv('FIREBASE_APP_ID', "1:123456789:web:abcdef123456")
};

export const isFirebaseConfigured = firebaseConfig.apiKey !== "YOUR_API_KEY_HERE";

let auth: any;
let db: any;

try {
  if (!isFirebaseConfigured) {
    console.warn("Legal Sathi: Firebase is NOT configured. Running in Local Demo Mode.");
  }
  
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  auth = null;
  db = null;
}

export { auth, db };