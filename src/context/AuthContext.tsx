import { createContext, useContext, useEffect, useState } from "react";

const STRAPI_URL = import.meta.env.VITE_STRAPI_BASE_URL ?? "http://localhost:1337";

type User = {
  id: number;
  username: string;
  email: string;
  avatar?: { id: number; url: string } | null;
  role?: {
    id: number;
    name: string;
  };
};

async function fetchUserWithRole(jwt: string, fallbackUser: User): Promise<User> {
  try {
    const res = await fetch(`${STRAPI_URL}/api/users/me?populate[0]=role&populate[1]=avatar`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!res.ok) return fallbackUser;
    return await res.json();
  } catch {
    return fallbackUser;
  }
}

type AuthContextType = {
  user: User | null;
  token: string | null;
  ambassadorMode: boolean;
  setAmbassadorMode: (enabled: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ambassadorMode, setAmbassadorModeState] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("strapi_jwt");
    const storedUser = localStorage.getItem("strapi_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    const storedAmbassadorMode = localStorage.getItem("ambassador_mode");
    if (storedAmbassadorMode !== null) {
      setAmbassadorModeState(storedAmbassadorMode === "true");
    }
  }, []);

  function setAmbassadorMode(enabled: boolean) {
    setAmbassadorModeState(enabled);
    localStorage.setItem("ambassador_mode", String(enabled));
  }

  async function login(email: string, password: string) {
    const res = await fetch(`${STRAPI_URL}/api/auth/local`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? "Login failed");
    }

    const data = await res.json();
    const fullUser = await fetchUserWithRole(data.jwt, data.user);
    setToken(data.jwt);
    setUser(fullUser);
    localStorage.setItem("strapi_jwt", data.jwt);
    localStorage.setItem("strapi_user", JSON.stringify(fullUser));
  }

  async function register(username: string, email: string, password: string) {
    const res = await fetch(`${STRAPI_URL}/api/auth/local/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message ?? "Registration failed");
    }

    const data = await res.json();
    const fullUser = await fetchUserWithRole(data.jwt, data.user);
    setToken(data.jwt);
    setUser(fullUser);
    localStorage.setItem("strapi_jwt", data.jwt);
    localStorage.setItem("strapi_user", JSON.stringify(fullUser));
  }

  function logout() {
    setToken(null);
    setUser(null);
    setAmbassadorModeState(true);
    localStorage.removeItem("strapi_jwt");
    localStorage.removeItem("strapi_user");
    localStorage.removeItem("ambassador_mode");
  }

  function updateUser(partial: Partial<User>) {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem("strapi_user", JSON.stringify(next));
      return next;
    });
  }

  return (
    <AuthContext.Provider
      value={{ user, token, ambassadorMode, setAmbassadorMode, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
