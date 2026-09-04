import React, { createContext, useContext, useState, useEffect, useTransition } from "react";
import { UserProfile, UserRole } from "../types";
import { AuthContextType, LoginCredentials, RegisterData } from "./authTypes";
import { authService } from "../services/authService";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [, startTransition] = useTransition();

  useEffect(() => {
    const existing = authService.getCurrentUser();
    if (existing) {
      setUser(existing);
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setIsLoading(true);
      const authenticatedUser = await authService.login(credentials);
      startTransition(() => {
        setUser(authenticatedUser);
      });
      return true;
    } catch (err) {
      console.error("Login failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterData): Promise<boolean> => {
    try {
      setIsLoading(true);
      const newUser = await authService.register(payload);
      startTransition(() => {
        setUser(newUser);
      });
      return true;
    } catch (err) {
      console.error("Registration failed:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = (profileUpdate: Partial<UserProfile>) => {
    const updated = authService.updateProfile(profileUpdate);
    if (updated) {
      setUser(updated);
    }
  };

  const value: AuthContextType = {
    user,
    role: (user?.role as UserRole) || null,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
