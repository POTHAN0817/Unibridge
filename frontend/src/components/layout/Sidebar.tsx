import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { roleNavigation } from "./Navbar";

export const Sidebar: React.FC = () => {
  const { role } = useAuth();
  if (!role) return null;

  const links = roleNavigation[role] || [];

  return (
    <aside className="w-64 bg-slate-50 border-r border-gray-200 hidden xl:block min-h-[calc(100vh-4rem)] p-4 flex-shrink-0">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-3">
        Navigation
      </div>
      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-xs font-semibold rounded-xl transition-all ${
                isActive
                  ? "bg-white text-blue-600 shadow-xs border border-gray-200"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
