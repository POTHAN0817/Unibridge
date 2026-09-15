import { useState } from "react";
import { Menu, X, Bell, User, ChevronDown, ArrowLeft } from "lucide-react";
import type { Page, Role } from "../types";
import { useAuth } from "../auth/AuthContext";

interface NavProps {
  currentPage: Page;
  role: Role | null;
  onNavigate: (page: Page) => void;
  onBack?: () => void;
  canGoBack?: boolean;
}

const citizenLinks = [
  { label: "Dashboard", page: "citizen-dashboard" as Page },
  { label: "Report", page: "report-challenge" as Page },
  { label: "Impact", page: "impact" as Page },
];

const govLinks = [
  { label: "Command Center", page: "gov-command" as Page },
  { label: "Impact", page: "impact" as Page },
];

const universityLinks = [
  { label: "Dashboard", page: "university-dashboard" as Page },
  { label: "Project Workspace", page: "project-workspace" as Page },
  { label: "Impact", page: "impact" as Page },
];

export default function Nav({ currentPage, role, onNavigate, onBack, canGoBack }: NavProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const links =
    role === "citizen"
      ? citizenLinks
      : role === "government"
        ? govLinks
        : role === "university" || role === "faculty"
          ? universityLinks
          : [];

  const isApp = role !== null && currentPage !== "landing" && currentPage !== "role-select";

  if (!isApp) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4" style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(11,99,246,0.08)" }}>
        <div className="flex items-center gap-3">
          {canGoBack && onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer border border-gray-200"
            >
              <ArrowLeft size={14} /> Back
            </button>
          )}
          <button onClick={() => onNavigate("landing")} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/unbridgelogo.png"
                alt="UniBridge"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-navy text-lg" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>UniBridge</span>
          </button>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => onNavigate("landing")} className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer">Home</button>
          <button onClick={() => onNavigate("impact")} className="text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors cursor-pointer">Impact</button>
          <button onClick={() => onNavigate("role-select")} className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105 cursor-pointer shadow-sm" style={{ background: "linear-gradient(135deg, #0B63F6, #00C2FF)" }}>
            Get Started
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3" style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(11,99,246,0.1)" }}>
      <div className="flex items-center gap-3">
        {canGoBack && onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer border border-gray-200"
          >
            <ArrowLeft size={14} /> Back
          </button>
        )}
        <button onClick={() => onNavigate("landing")} className="flex items-center gap-2 cursor-pointer">
          <img
            src="/unbridgelogo.png"
            alt="UniBridge"
            className="w-7 h-7 object-contain"
          />
          <span className="font-bold text-navy text-base" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>UniBridge</span>
        </button>
      </div>

      <div className="hidden md:flex items-center gap-1">
        {links.map((l) => (
          <button
            key={l.page}
            onClick={() => onNavigate(l.page)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${currentPage === l.page ? "text-blue-600 bg-blue-50 font-bold" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"}`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-all cursor-pointer">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-500"></span>
        </button>
        <button className="flex items-center gap-2 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100 transition-all cursor-pointer">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-electric-500 to-cyan-500 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className="text-sm font-medium hidden md:block" style={{ color: "#071A33" }}>
            {user?.name || (user?.profile as Record<string, any>)?.full_name || (user?.profile as Record<string, any>)?.officer_name || (user?.profile as Record<string, any>)?.contact_person || (role ? `${role.charAt(0).toUpperCase() + role.slice(1)} User` : "User")}
          </span>
          <ChevronDown size={14} className="text-gray-400" />
        </button>
        <button className="md:hidden p-2 text-gray-600 hover:text-gray-900" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 md:hidden py-4 px-6 flex flex-col gap-2 bg-white border-b border-gray-200 shadow-lg">
          {links.map((l) => (
            <button key={l.page} onClick={() => { onNavigate(l.page); setOpen(false); }} className="text-left px-4 py-3 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 text-sm font-medium transition-all">
              {l.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}

