import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface DashboardHeaderProps {
  badge?: string;
  badgeColor?: string;
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  children?: React.ReactNode;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  badge,
  badgeColor = "#0B63F6",
  title,
  subtitle,
  backTo,
  backLabel = "Back",
  children,
}) => {
  return (
    <div className="bg-slate-50 border-b border-gray-200 px-6 py-6">
      <div className="max-w-7xl mx-auto">
        {backTo && (
          <Link
            to={backTo}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-all mb-4 shadow-xs"
          >
            <ArrowLeft size={14} /> {backLabel}
          </Link>
        )}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {badge && (
              <div
                className="inline-flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase mb-1"
                style={{ color: badgeColor }}
              >
                {badge}
              </div>
            )}
            <h1
              className="text-2xl md:text-3xl font-extrabold text-[#071A33]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h1>
            {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
          </div>

          {children && <div className="flex items-center gap-3">{children}</div>}
        </div>
      </div>
    </div>
  );
};
