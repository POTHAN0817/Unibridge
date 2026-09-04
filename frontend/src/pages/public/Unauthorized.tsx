import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldAlert, ArrowLeft, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";

export default function Unauthorized() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const state = location.state as { attemptedRole?: string; currentRole?: string } | null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center mb-6 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">
          Access Restricted
        </div>
        <h1
          className="text-2xl font-extrabold text-[#071A33] mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Role Authorization Required
        </h1>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          You are currently signed in as a{" "}
          <span className="font-bold text-gray-800 capitalize">{role || "guest"}</span>.
          {state?.attemptedRole && (
            <span>
              {" "}This section is reserved exclusively for{" "}
              <span className="font-bold text-blue-600 capitalize">{state.attemptedRole}</span>{" "}
              officials.
            </span>
          )}
        </p>

        <div className="space-y-3">
          {role && (
            <Link
              to={`/${role}/dashboard`}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
            >
              <LayoutDashboard size={16} /> Go to My {role.toUpperCase()} Dashboard
            </Link>
          )}

          <Link
            to="/roles"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            Switch to Another Role
          </Link>

          <button
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            <LogOut size={14} /> Sign out completely
          </button>
        </div>
      </div>
    </div>
  );
}
