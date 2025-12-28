import { auth, db, isFirebaseConfigured } from "./firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { User, UserRole } from "../types";
import { MockBackend } from "./mockBackend";

export const AuthService = {
  register: async (name: string, email: string, password: string, role: UserRole): Promise<{ user: User, token: string }> => {
    // FALLBACK TO MOCK IF NOT CONFIGURED
    if (!isFirebaseConfigured || !auth) {
      console.log("AuthService: Using Mock Registration");
      return MockBackend.register(name, email, password, role);
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      await updateProfile(firebaseUser, { displayName: name });

      const newUser: User = {
        id: firebaseUser.uid,
        name: name,
        email: email,
        role: role,
        verified: true,
        avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a8a&color=fff`
      };

      await setDoc(doc(db, "users", firebaseUser.uid), newUser);
      const token = await firebaseUser.getIdToken();

      return { user: newUser, token };
    } catch (error: any) {
      console.error("Firebase Registration Error:", error);
      throw new Error(formatFirebaseError(error.code));
    }
  },

  login: async (email: string, password: string): Promise<{ user: User, token: string }> => {
    // FALLBACK TO MOCK IF NOT CONFIGURED
    if (!isFirebaseConfigured || !auth) {
      console.log("AuthService: Using Mock Login");
      return MockBackend.login(email, password);
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const docRef = doc(db, "users", firebaseUser.uid);
      const docSnap = await getDoc(docRef);

      let user: User;
      if (docSnap.exists()) {
        user = docSnap.data() as User;
      } else {
        user = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          role: UserRole.USER,
          verified: true,
          avatarUrl: firebaseUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firebaseUser.email || "U")}`
        };
      }

      const token = await firebaseUser.getIdToken();
      return { user, token };
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      throw new Error(formatFirebaseError(error.code));
    }
  },

  logout: async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    localStorage.removeItem('legal_sathi_token');
    localStorage.removeItem('legal_sathi_user');
  }
};

const formatFirebaseError = (code: string): string => {
  switch (code) {
    case 'auth/email-already-in-use': return "This email is already registered.";
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found': return "Invalid email or password.";
    case 'auth/weak-password': return "Password should be at least 6 characters.";
    default: return "Authentication failed. Please check your network.";
  }
};