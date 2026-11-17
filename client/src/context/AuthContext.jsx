import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, setStoredToken } from "../services/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal control
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState("login"); // 'login' | 'register'
  const [initialRole, setInitialRole] = useState("customer"); // 'customer' | 'vendor'

  // Fetch current user on mount
  const checkAuth = useCallback(async () => {
    try {
      const data = await authApi.getMe();
      if (data?.ok && data.user) {
        setUser(data.user);
        setVendor(data.vendor || null);
      } else {
        setUser(null);
        setVendor(null);
        setStoredToken(null);
      }
    } catch {
      setUser(null);
      setVendor(null);
      setStoredToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password, rememberMe = false) => {
    const data = await authApi.login({ email, password, rememberMe });
    if (data?.ok) {
      setUser(data.user);
      setVendor(data.vendor || null);
      setStoredToken(data.token);
      setAuthModalOpen(false);
      return data;
    }
    throw new Error(data?.message || "Login failed");
  };

  const register = async (payload) => {
    const data = await authApi.register(payload);
    if (data?.ok) {
      setUser(data.user);
      setVendor(data.vendor || null);
      setStoredToken(data.token);
      setAuthModalOpen(false);
      return data;
    }
    throw new Error(data?.message || "Registration failed");
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn("Logout error:", err);
    } finally {
      setUser(null);
      setVendor(null);
      setStoredToken(null);
      window.location.hash = "#top";
    }
  };

  const updateProfile = async (profileData) => {
    const data = await authApi.updateProfile(profileData);
    if (data?.ok) {
      setUser(data.user);
      if (data.vendor) setVendor(data.vendor);
      return data;
    }
    throw new Error(data?.message || "Profile update failed");
  };

  const openLogin = () => {
    setAuthModalView("login");
    setAuthModalOpen(true);
  };

  const openRegister = (role = "customer") => {
    setInitialRole(role);
    setAuthModalView("register");
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const value = {
    user,
    vendor,
    loading,
    isAuthenticated: Boolean(user),
    authModalOpen,
    authModalView,
    initialRole,
    login,
    register,
    logout,
    updateProfile,
    refreshUser: checkAuth,
    openLogin,
    openRegister,
    closeAuthModal,
    setAuthModalView,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
