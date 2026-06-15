import { createContext, useContext, useState, useCallback } from "react";
import { findUser } from "../data/users";

// Authentication Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("cv_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email, password) => {
    const found = findUser(email, password);
    if (found) {
      const safeUser = { ...found };
      delete safeUser.password;
      setUser(safeUser);
      sessionStorage.setItem("cv_user", JSON.stringify(safeUser));
      return { success: true, user: safeUser };
    }
    return { success: false, error: "Invalid email or password" };
  }, []);

  const register = useCallback((name, email, password, role = "customer") => {
    // Mock registration – just auto-login with demo credentials
    const newUser = {
      id: Date.now(),
      name,
      email,
      role,
      mobile: "",
      preferredLocation: "",
      avatar: name.slice(0, 2).toUpperCase(),
      joinDate: new Date().toISOString().split("T")[0],
      bookings: [],
    };
    setUser(newUser);
    sessionStorage.setItem("cv_user", JSON.stringify(newUser));
    return { success: true, user: newUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("cv_user");
  }, []);

  const isAuthenticated = !!user;
  const isCustomer = user?.role === "customer";
  const isOwner = user?.role === "owner";
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated, isCustomer, isOwner, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
