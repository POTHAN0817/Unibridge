import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { AuthUser, UserRole } from "../types";
import { AuthContextType, LoginCredentials, AuthResult } from "./authTypes";
import { authService } from "../services/authService";
import { getStoredToken, removeStoredToken, setStoredToken } from "../services/api";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate stored token with GET /api/auth/me on startup
  const restoreSession = useCallback(async () => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setUser(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    try {
      const authUser = await authService.getMe();
      setUser(authUser);
      setToken(storedToken);
    } catch (error) {
      console.warn("[UniBridge Auth] Stored session verification failed, clearing session:", error);
      removeStoredToken();
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  /**
   * Real login via POST /api/auth/login.
   */
  const login = async (credentials: LoginCredentials): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const { user: authUser, token: accessToken } = await authService.login(credentials);
      setUser(authUser);
      setToken(accessToken);
      return { success: true };
    } catch (err: any) {
      console.error("[UniBridge Auth] Login error:", err);
      return {
        success: false,
        error: err.message || "Invalid email or password.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Real registration via POST /api/auth/register/{role}.
   */
  const register = async (role: UserRole, payload: Record<string, unknown>): Promise<AuthResult> => {
    setIsLoading(true);
    try {
      const response = await authService.register(role, payload);

      // Option A: Backend returned an access token on registration -> auto log in
      if (response.access_token && response.user) {
        setStoredToken(response.access_token);
        setUser(response.user);
        setToken(response.access_token);
        return { success: true, autoLoggedIn: true };
      }

      // Option B: Backend returned registration success without token -> user must log in
      return { success: true, autoLoggedIn: false };
    } catch (err: any) {
      console.error("[UniBridge Auth] Registration error:", err);
      return {
        success: false,
        error: err.message || "Registration failed. Please check form fields.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Real logout via POST /api/auth/logout and client token clearing.
   */
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setToken(null);
      setIsLoading(false);
    }
  };

  const refreshSession = async (): Promise<void> => {
    await restoreSession();
  };

  const updateProfile = (profileUpdate: Partial<AuthUser>) => {
    if (user) {
      setUser({
        ...user,
        ...profileUpdate,
      });
    }
  };

  const value: AuthContextType = {
    user,
    role: user?.role || null,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    register,
    logout,
    refreshSession,
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
