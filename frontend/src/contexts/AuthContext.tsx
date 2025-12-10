import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import api from "@/lib/api";
import { getToken, isLoggedIn } from "@/lib/auth";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: "CUSTOMER" | "PROVIDER" | "ADMIN";
  provider?: "LOCAL" | "GOOGLE";
  avatarUrl?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  providerProfile?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (!isLoggedIn()) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
