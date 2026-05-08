import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateProfile: (name: string, email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = "/api";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // On mount, verify token is still valid
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && user) {
      fetch(`${API_BASE}/auth/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      })
        .then(res => {
          if (!res.ok) {
            // Token expired or invalid
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("access_token");
          }
        })
        .catch(() => {
          // Network error, keep the local state but don't clear
        });
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend returns 401 for invalid credentials
        return { success: false, message: data.error || "Email atau password salah" };
      }

      // Save JWT token
      localStorage.setItem("access_token", data.access_token);

      // Map backend user to our User interface
      const loggedInUser: User = {
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        role: data.user.role || "user",
      };

      setUser(loggedInUser);
      localStorage.setItem("user", JSON.stringify(loggedInUser));

      return { success: true };
    } catch (error) {
      return { success: false, message: "Gagal terhubung ke server. Pastikan backend berjalan." };
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Backend returns 400 with validation errors
        let errorMessage = "Registrasi gagal";
        if (typeof data === "string") {
          try {
            const parsed = JSON.parse(data);
            // Extract first error message
            const firstKey = Object.keys(parsed)[0];
            if (firstKey) {
              errorMessage = parsed[firstKey][0];
            }
          } catch {
            errorMessage = data;
          }
        } else if (data.email) {
          errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        } else if (data.password) {
          errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
        } else if (data.name) {
          errorMessage = Array.isArray(data.name) ? data.name[0] : data.name;
        }
        return { success: false, message: errorMessage };
      }

      // Registration successful — now auto-login
      const loginResult = await login(email, password);
      return loginResult;
    } catch (error) {
      return { success: false, message: "Gagal terhubung ke server. Pastikan backend berjalan." };
    }
  };

  const logout = () => {
    const token = localStorage.getItem("access_token");
    
    // Call backend logout to invalidate token
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      }).catch(() => {
        // Ignore errors on logout
      });
    }

    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
  };

  const updateProfile = (name: string, email: string) => {
    if (user) {
      const updated = { ...user, name, email };
      setUser(updated);
      localStorage.setItem("user", JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
