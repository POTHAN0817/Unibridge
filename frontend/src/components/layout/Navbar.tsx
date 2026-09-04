import React, { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "lucide-react";
import { Link as RouterLink, NavLink as RouterNavLink, useNavigate as useRouterNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { Zap, Bell, User, ChevronDown, LogOut, ShieldCheck, Menu, X, ArrowLeft } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { UserRole } from "../../types";

export interface NavItemConfig {
  label: string;
  path: string;
}

export const roleNavigation: Record<UserRole, NavItemConfig[]> = {
  citizen: [
    { label: "Dashboard", path: "/citizen/dashboard" },
    { label: "Report Challenge", path: "/citizen/report" },
    { label: "My Challenges", path: "/citizen/challenges" },
    { label: "Impact", path: "/citizen/impact" },
    { label: "Profile", path: "/citizen/profile" },
  ],
  university: [
    { label: "Dashboard", path: "/university/dashboard" },
    { label: "Challenges", path: "/university/challenges" },
    { label: "Projects", path: "/university/projects" },
    { label: "Teams", path: "/university/teams" },
    { label: "Faculty", path: "/university/faculty" },
    { label: "Students", path: "/university/students" },
    { label: "Impact", path: "/university/impact" },
    { label: "Profile", path: "/university/profile" },
  ],
  industry: [
    { label: "Dashboard", path: "/industry/dashboard" },
    { label: "Challenges", path: "/industry/challenges" },
    { label: "Projects", path: "/industry/projects" },
    { label: "Mentorship", path: "/industry/mentorship" },
    { label: "Funding", path: "/industry/funding" },
    { label: "Technology", path: "/industry/technology" },
    { label: "Impact", path: "/industry/impact" },
    { label: "Profile", path: "/industry/profile" },
  ],
  government: [
    { label: "Dashboard", path: "/government/dashboard" },
    { label: "Challenges", path: "/government/challenges" },
    { label: "Validation", path: "/government/validation" },
    { label: "Projects", path: "/government/projects" },
    { label: "Universities", path: "/government/universities" },
    { label: "Industry", path: "/government/industry" },
    { label: "Analytics", path: "/government/analytics" },
    { label: "Impact", path: "/government/impact" },
    { label: "Profile", path: "/government/profile" },
  ],
};

const roleColors: Record<UserRole, { primary: string; light: string; border: string }> = {
  citizen: { primary: "#0B63F6", light: "rgba(11,99,246,0.08)", border: "rgba(11,99,246,0.2)" },
  university: { primary: "#8B5CF6", light: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)" },
  industry: { primary: "#F59E0B", light: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)" },
  government: { primary: "#10B981", light: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)" },
};

export const Navbar: React.FC = () => {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useRouterNavigate();
  const location = useRouterLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const isPublicPage = location.pathname === "/" || location.pathname === "/roles" || location.pathname.startsWith("/auth/");
  const links = role ? roleNavigation[role] : [];
  const theme = role ? roleColors[role] : roleColors.citizen;

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate(role ? `/auth/${role}/login` : "/");
  };

  // Public Landing / Auth Header
  if (!isAuthenticated || isPublicPage) {
    return (
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-md border-b border-gray-100"
      >
        <div className="flex items-center gap-3">
          <RouterLink to="/" className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs"
              style={{ background: "linear-gradient(135deg, #0B63F6, #00C2FF)" }}
            >
              <Zap size={16} className="text-white" />
            </div>
            <span
              className="font-extrabold text-lg text-[#071A33] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              UniBridge
            </span>
          </RouterLink>
        </div>

        <div className="flex items-center gap-4">
          <RouterLink
            to="/roles"
            className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 shadow-sm"
            style={{ background: "linear-gradient(135deg, #0B63F6, #00C2FF)" }}
          >
            Access Platform
          </RouterLink>
        </div>
      </header>
    );
  }

  // Role Authenticated Navigation Header
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Brand & Role Tag */}
        <div className="flex items-center gap-3">
          <RouterLink to={`/${role}/dashboard`} className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shadow-xs"
              style={{ background: "linear-gradient(135deg, #0B63F6, #00C2FF)" }}
            >
              <Zap size={16} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span
                className="font-extrabold text-base text-[#071A33] leading-none"
                style={{ fontFamily: "var(--font-display)" }}
              >
                UniBridge
              </span>
              <span
                className="text-[10px] font-bold tracking-wider uppercase mt-0.5"
                style={{ color: theme.primary }}
              >
                {role} portal
              </span>
            </div>
          </RouterLink>
        </div>

        {/* Desktop Role Navigation */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1 max-w-[60%]">
          {links.map((item) => (
            <RouterNavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "text-white shadow-xs"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: theme.primary } : {}
              }
            >
              {item.label}
            </RouterNavLink>
          ))}
        </nav>

        {/* Right actions: Notifications & User Profile dropdown */}
        <div className="flex items-center gap-3">
          <button
            title="Notifications"
            className="relative p-2 rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-white"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-transparent hover:border-gray-200"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: theme.primary }}
              >
                {user?.avatar || user?.name?.[0] || "U"}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-[#071A33] line-clamp-1 max-w-[130px]">
                  {user?.name}
                </span>
                <span className="text-[10px] text-gray-500 capitalize">
                  {user?.designation || user?.role}
                </span>
              </div>
              <ChevronDown size={14} className="text-gray-400" />
            </button>

            {/* Dropdown */}
            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-gray-100">
                  <p className="text-xs font-bold text-[#071A33]">{user?.name}</p>
                  <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
                  <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize" style={{ background: theme.light, color: theme.primary }}>
                    <ShieldCheck size={10} /> {user?.role} Account
                  </div>
                </div>

                <div className="py-1">
                  <RouterLink
                    to={`/${role}/profile`}
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    <User size={14} /> Profile & Settings
                  </RouterLink>
                  <RouterLink
                    to="/roles"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    Switch Workspace Role
                  </RouterLink>
                </div>

                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 shadow-lg space-y-1">
          {links.map((item) => (
            <RouterNavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "text-white font-bold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`
              }
              style={({ isActive }) =>
                isActive ? { background: theme.primary } : {}
              }
            >
              {item.label}
            </RouterNavLink>
          ))}
          <div className="pt-2 border-t border-gray-100 mt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
