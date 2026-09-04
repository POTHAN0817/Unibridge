import React from "react";
import { ChallengeStatus } from "../../types";

interface StatusBadgeProps {
  status: ChallengeStatus | string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  const getStyle = (s: string) => {
    switch (s) {
      case "Submitted":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "AI Analyzed":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";
      case "Validated":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "Assigned":
      case "In Progress":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Testing":
      case "Pilot Development":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "Resolved":
      case "Impact Measured":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${getStyle(
        status
      )} ${className}`}
    >
      {status}
    </span>
  );
};
