import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { UserRole } from "../types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-blue-600 border-t-transparent animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Determine the most appropriate login page based on the attempted path
    let targetLogin = "/roles";
    if (allowedRoles && allowedRoles.length === 1) {
      targetLogin = `/auth/${allowedRoles[0]}/login`;
    } else if (location.pathname.startsWith("/citizen")) {
      targetLogin = "/auth/citizen/login";
    } else if (location.pathname.startsWith("/university")) {
      targetLogin = "/auth/university/login";
    } else if (location.pathname.startsWith("/industry")) {
      targetLogin = "/auth/industry/login";
    } else if (location.pathname.startsWith("/government")) {
      targetLogin = "/auth/government/login";
    }

    return <Navigate to={targetLogin} state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" state={{ attemptedRole: allowedRoles[0], currentRole: user.role }} replace />;
  }

  return <>{children}</>;
};
