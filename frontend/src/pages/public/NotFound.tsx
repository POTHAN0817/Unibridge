import React from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-6 shadow-sm">
          <AlertTriangle size={32} />
        </div>
        <div className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">
          404 Error
        </div>
        <h1
          className="text-3xl font-extrabold text-[#071A33] mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Page Not Found
        </h1>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          The requested page does not exist or has been relocated within the UniBridge innovation network.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
          >
            <Home size={16} /> Return to Home
          </Link>
          <Link
            to="/roles"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all"
          >
            <Compass size={16} /> Choose Portal Role
          </Link>
        </div>
      </div>
    </div>
  );
}
