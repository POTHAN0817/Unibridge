import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap, ShieldCheck } from "lucide-react";
import { UserRole } from "../../types";

interface RoleAuthLayoutProps {
  role: UserRole;
  badge: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

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
}) => {
  const theme = roleTheme[role];

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
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg, #0B63F6, #00C2FF)" }}
            >
              <Zap size={20} className="text-white" />
            </div>
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
    </div>
  );
};
