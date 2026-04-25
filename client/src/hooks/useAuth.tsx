import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";

type User = {
  id: string;
  name: string;
  email: string;
};

type Ctx = {
  user: User | null;
  loading: boolean;
  signOut: () => void;
};

const AuthContext = createContext<Ctx>({
  user: null,
  loading: true,
  signOut: () => { }
});

const API = "http://localhost:5000/api";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    axios.get(`${API}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        setUser(res.data);
      })
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });

  }, []);

  const signOut = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/auth"; // adjust if your route differs
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);