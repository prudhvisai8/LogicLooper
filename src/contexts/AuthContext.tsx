import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  GoogleAuthProvider,
  User,
} from "firebase/auth";

import { auth, googleProvider } from "@/lib/firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  authLoading: boolean;
  signInWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  signUpWithEmail: (
    email: string,
    password: string
  ) => Promise<{ error?: string }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  logout: () => Promise<{ error?: string }>;
  continueAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  // 🔄 Firebase session listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        setIsGuest(false); // If real user logs in, disable guest
      }
    });

    return () => unsubscribe();
  }, []);

  // 📧 Email Sign In
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return {};
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // 📧 Email Sign Up
  const signUpWithEmail = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      return {};
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // 🔵 Google Sign In
  const signInWithGoogle = async () => {
    try {
      setAuthLoading(true);

      const result = await signInWithPopup(auth, googleProvider);

      // Optional: extract token if backend verification needed
      const credential =
        GoogleAuthProvider.credentialFromResult(result);
      const token = credential?.accessToken;

      return {};
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // 🚪 IMPROVED Logout
  const logout = async () => {
    try {
      setAuthLoading(true);

      // 1️⃣ Sign out from Firebase
      await signOut(auth);

      // 2️⃣ Clear guest mode
      setIsGuest(false);

      // 3️⃣ Clear local storage (optional but recommended)
      localStorage.clear();
      sessionStorage.clear();

      // 4️⃣ Clear user state manually (safety)
      setUser(null);

      return {};
    } catch (err: any) {
      return { error: err.message };
    } finally {
      setAuthLoading(false);
    }
  };

  // 👤 Guest Mode
  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authLoading,
        isGuest,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        continueAsGuest,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used within AuthProvider");
  return context;
};
