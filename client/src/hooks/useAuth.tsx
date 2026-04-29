import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

type Role = "admin" | "user";

type User = {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
};

type Ctx = {
  user: User | null;
  loading: boolean;
  roles: Role[];
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
  setAuthData: (user: User, token: string) => void;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

const API = "http://localhost:5000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  async function refreshUser() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const res = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = res.data;

      if (data) {
        setUser(data);
        setRoles(data.role === "admin" ? ["admin", "user"] : ["user"]);
      } else {
        setUser(null);
        setRoles([]);
      }
    } catch {
      setUser(null);
      setRoles([]);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }

  const setAuthData = (userData: User, token: string) => {
    localStorage.setItem("token", token);
    setUser(userData);
    setRoles(userData.role === "admin" ? ["admin", "user"] : ["user"]);
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signOut = async () => {
    localStorage.removeItem("token");
    setUser(null);
    setRoles([]);
    window.location.href = "/auth";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        roles,
        isAdmin: roles.includes("admin"),
        refreshUser,
        signOut,
        setAuthData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
};