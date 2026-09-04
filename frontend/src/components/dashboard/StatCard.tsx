import React from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color?: string;
  subtext?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  change,
  icon: Icon,
  color = "#0B63F6",
  subtext,
}) => {
  return (
    <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, color: color }}
        >
          <Icon size={18} />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <div
          className="text-2xl lg:text-3xl font-extrabold text-[#071A33]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value}
        </div>
        {change && (
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            {change}
          </span>
        )}
      </div>
      {subtext && <div className="text-xs text-gray-400 mt-1.5">{subtext}</div>}
    </div>
  );
};
