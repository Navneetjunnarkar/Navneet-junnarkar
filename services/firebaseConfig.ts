import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Helper to safely access env vars without crashing in browser
const getEnv = (key: string, defaultVal: string) => {
  try {
    // @ts-ignore
    return process.env[key] || defaultVal;
  } catch (e) {
    return defaultVal;
  }
};

// TODO: Replace the string values below with your actual Firebase configuration
// You can get this from the Firebase Console -> Project Settings -> General -> Your Apps
const firebaseConfig = {
  apiKey: getEnv('FIREBASE_API_KEY', "YOUR_API_KEY_HERE"),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN', "your-app.firebaseapp.com"),
  projectId: getEnv('FIREBASE_PROJECT_ID', "your-app-id"),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET', "your-app-id.appspot.com"),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID', "123456789"),
  appId: getEnv('FIREBASE_APP_ID', "1:123456789:web:abcdef123456")
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);