import { auth, db } from "./firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User, UserRole } from "../types";

export const AuthService = {
  /**
   * Register a new user in Firebase Auth and save details to Firestore
   */
  register: async (name: string, email: string, password: string, role: UserRole): Promise<{ user: User, token: string }> => {
    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Update Profile Name
      await updateProfile(firebaseUser, { displayName: name });

      // 3. Prepare User Data
      const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        role: role,
        verified: true, // Default to true for demo
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a8a&color=fff`
      };

      // 4. Save extra details (Role, etc.) to Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), newUser);

      // 5. Get Token
      const token = await firebaseUser.getIdToken();

      return { user: newUser, token };
    } catch (error: any) {
      console.error("Registration Error:", error);
      throw new Error(formatFirebaseError(error.code));
    }
  },

  /**
   * Login with Firebase Auth and fetch details from Firestore
   */
  login: async (email: string, password: string): Promise<{ user: User, token: string }> => {
    try {
      // 1. Sign In
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // 2. Fetch User Details (Role) from Firestore
      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      let user: User;

      if (docSnap.exists()) {
        user = docSnap.data() as User;
      } else {
        // Fallback if firestore record doesn't exist but auth does
        user = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          role: UserRole.USER,
          verified: true,
          avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.email || "U")}`
        };
      }

      // 3. Get Token
      const token = await firebaseUser.getIdToken();

      return { user, token };
    } catch (error: any) {
      console.error("Login Error:", error);
      throw new Error(formatFirebaseError(error.code));
    }
  },

  logout: async () => {
    await signOut(auth);
  }
};

// Helper to make Firebase error codes human readable
const formatFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use':
      return "This email is already registered.";
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return "Invalid email or password.";
    case 'auth/weak-password':
      return "Password should be at least 6 characters.";
    case 'auth/network-request-failed':
      return "Network error. Please check your internet connection.";
    default:
      return "Authentication failed. Please check your configuration.";
  }
};