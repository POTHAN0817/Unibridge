import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ShieldCheck,
  Copy,
  Check,
  Users,
  GraduationCap,
  Briefcase,
  Landmark,
  KeyRound,
} from "lucide-react";
import { UserRole } from "../../types";

interface RoleAuthLayoutProps {
  role: UserRole;
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showDemoCredentials?: boolean;
}

interface DemoCredential {
  role: UserRole;
  title: string;
  email: string;
  password: string;
  loginPath: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgSoft: string;
  border: string;
}

const DEMO_CREDENTIALS: DemoCredential[] = [
  {
    role: "citizen",
    title: "Citizen",
    email: "sushmitha200527@gmail.com",
    password: "123456789",
    loginPath: "/auth/citizen/login",
    icon: Users,
    color: "#0B63F6",
    bgSoft: "rgba(11,99,246,0.06)",
    border: "rgba(11,99,246,0.2)",
  },
  {
    role: "university",
    title: "University",
    email: "99240040409@klu.ac.in",
    password: "123456789",
    loginPath: "/auth/university/login",
    icon: GraduationCap,
    color: "#8B5CF6",
    bgSoft: "rgba(139,92,246,0.06)",
    border: "rgba(139,92,246,0.2)",
  },
  {
    role: "industry",
    title: "Industry",
    email: "sushmithareddyn27@gmail.com",
    password: "123456789",
    loginPath: "/auth/industry/login",
    icon: Briefcase,
    color: "#F59E0B",
    bgSoft: "rgba(245,158,11,0.06)",
    border: "rgba(245,158,11,0.2)",
  },
  {
    role: "government",
    title: "Government",
    email: "rajan12345@gmail.com",
    password: "123456789",
    loginPath: "/auth/government/login",
    icon: Landmark,
    color: "#10B981",
    bgSoft: "rgba(16,185,129,0.06)",
    border: "rgba(16,185,129,0.2)",
  },
];

const roleTheme: Record<UserRole, { color: string; bgSoft: string; border: string }> = {
  citizen: { color: "#0B63F6", bgSoft: "rgba(11,99,246,0.06)", border: "rgba(11,99,246,0.2)" },
  university: { color: "#8B5CF6", bgSoft: "rgba(139,92,246,0.06)", border: "rgba(139,92,246,0.2)" },
  industry: { color: "#F59E0B", bgSoft: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.2)" },
  government: { color: "#10B981", bgSoft: "rgba(16,185,129,0.06)", border: "rgba(16,185,129,0.2)" },
};

export const RoleAuthLayout: React.FC<RoleAuthLayoutProps> = ({
  role,
  badge,
  title,
  subtitle,
  children,
  showDemoCredentials,
}) => {
  const theme = roleTheme[role];
  const location = useLocation();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const isLoginPage = location.pathname.includes("/login");
  const shouldShowDemoCredentials = showDemoCredentials ?? isLoginPage;

  const handleCopy = (text: string, fieldId: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setCopiedField(fieldId);
          setTimeout(() => setCopiedField(null), 2000);
        })
        .catch(() => {
          fallbackCopy(text, fieldId);
        });
    } else {
      fallbackCopy(text, fieldId);
    }
  };

  const fallbackCopy = (text: string, fieldId: string) => {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.setAttribute("readonly", "");
      el.style.position = "absolute";
      el.style.left = "-9999px";
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopiedField(fieldId);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore
    }
  };

  const currentCred = DEMO_CREDENTIALS.find((c) => c.role === role);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top back link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mb-4">
        <Link
          to="/roles"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Role Selection
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Logo and Headings */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <img
              src="/unbridgelogo.png"
              alt="UniBridge"
              className="w-10 h-10 object-contain"
            />
            <span
              className="text-2xl font-extrabold text-[#071A33]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              UniBridge
            </span>
          </Link>

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3"
            style={{ background: theme.bgSoft, color: theme.color, border: `1px solid ${theme.border}` }}
          >
            <ShieldCheck size={13} /> {badge}
          </div>

          <h2
            className="text-2xl sm:text-3xl font-extrabold text-[#071A33] tracking-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">{subtitle}</p>
        </div>

        {/* Form Card */}
        <div className="mt-8 bg-white py-8 px-6 sm:px-10 shadow-sm border border-gray-200/80 rounded-2xl">
          {children}
        </div>
      </div>

      {/* Demo Login Credentials Section - Specific to Current Module */}
      {shouldShowDemoCredentials && currentCred && (
        <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 mt-6">
          <div
            className="bg-white rounded-2xl border p-5 sm:p-6 shadow-sm"
            style={{ borderColor: "rgba(229, 231, 235, 0.9)" }}
          >
            {/* Section Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: currentCred.bgSoft, color: currentCred.color }}
                >
                  <KeyRound size={16} />
                </div>
                <div>
                  <h3
                    className="text-sm font-bold text-[#071A33] tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Demo Login Credentials
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {currentCred.title} Portal &bull; SIH Evaluator Demo
                  </p>
                </div>
              </div>

              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                style={{
                  background: currentCred.bgSoft,
                  color: currentCred.color,
                  border: `1px solid ${currentCred.border}`,
                }}
              >
                {currentCred.title}
              </span>
            </div>

            {/* Credentials Fields */}
            <div className="space-y-3">
              {/* Email Field */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  <span>Email</span>
                  {copiedField === `${currentCred.role}-email` && (
                    <span className="text-emerald-600 font-semibold normal-case flex items-center gap-1 text-[11px]">
                      <Check size={12} /> Copied!
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 gap-2 hover:bg-slate-100/70 transition-colors">
                  <span className="font-mono text-xs text-gray-800 select-all truncate font-medium">
                    {currentCred.email}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentCred.email, `${currentCred.role}-email`)}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0 cursor-pointer"
                    title={`Copy ${currentCred.title} email`}
                    aria-label={`Copy ${currentCred.title} email`}
                  >
                    {copiedField === `${currentCred.role}-email` ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  <span>Password</span>
                  {copiedField === `${currentCred.role}-password` && (
                    <span className="text-emerald-600 font-semibold normal-case flex items-center gap-1 text-[11px]">
                      <Check size={12} /> Copied!
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 gap-2 hover:bg-slate-100/70 transition-colors">
                  <span className="font-mono text-xs text-gray-800 select-all font-medium">
                    {currentCred.password}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentCred.password, `${currentCred.role}-password`)}
                    className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-200 transition-colors flex-shrink-0 cursor-pointer"
                    title={`Copy ${currentCred.title} password`}
                    aria-label={`Copy ${currentCred.title} password`}
                  >
                    {copiedField === `${currentCred.role}-password` ? (
                      <Check size={14} className="text-emerald-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Switch Role link */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
              <span>Evaluating another module?</span>
              <Link
                to="/roles"
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-0.5"
              >
                Switch Role &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

