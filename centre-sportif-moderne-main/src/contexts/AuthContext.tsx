import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "@/services/api";

/* =========================
   TYPES
========================= */

interface User {
  username: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

/* =========================
   CONTEXT
========================= */

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

/* =========================
   PROVIDER
========================= */

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /* =========================
     INIT (PAGE REFRESH)
  ========================= */

  useEffect(() => {
    const storedUsername = localStorage.getItem("user");

    if (storedUsername && authService.isAuthenticated()) {
      setUser({ username: storedUsername });
    }

    setIsLoading(false);
  }, []);

  /* =========================
     ACTIONS
  ========================= */

  const login = async (username: string, password: string) => {
    setIsLoading(true);

    await authService.login(username, password);

    localStorage.setItem("user", username);
    setUser({ username });

    setIsLoading(false);
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem("user");
    setUser(null);
  };

  /* =========================
     CONTEXT VALUE
  ========================= */

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && authService.isAuthenticated(),
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
