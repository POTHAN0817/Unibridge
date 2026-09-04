import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { UserRole } from "../../types";
import { mockUsers } from "../../data/mock/users";

interface LoginFormProps {
  role: UserRole;
  registerPath: string;
  submitButtonColor?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  role,
  registerPath,
  submitButtonColor = "#0B63F6",
}) => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const defaultMock = mockUsers[role];

  const [email, setEmail] = useState(defaultMock?.email || "");
  const [password, setPassword] = useState("password123");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    const success = await login({
      email,
      password,
      role,
      rememberMe,
    });

    if (success) {
      navigate(`/${role}/dashboard`);
    } else {
      setError("Authentication failed. Please check your credentials.");
    }
  };

  const handleQuickDemoFill = () => {
    if (defaultMock) {
      setEmail(defaultMock.email);
      setPassword("password123");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* Demo helper banner */}
      <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-blue-600" />
          <span className="text-xs text-blue-800 font-medium">
            Demo account: <strong className="font-semibold">{defaultMock?.name}</strong>
          </span>
        </div>
        <button
          type="button"
          onClick={handleQuickDemoFill}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
        >
          Auto-fill
        </button>
      </div>

      <div>
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Mail size={16} />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Password
          </label>
          <a
            href="#forgot"
            onClick={(e) => {
              e.preventDefault();
              alert("Password reset instructions have been sent to your registered email (Mock).");
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Lock size={16} />
          </div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-600">Remember me for 30 days</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
        style={{ background: submitButtonColor }}
      >
        {isLoading ? (
          <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
        ) : (
          <>
            Sign In to {role.charAt(0).toUpperCase() + role.slice(1)} Portal
            <ArrowRight size={16} />
          </>
        )}
      </button>

      <div className="text-center pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Don't have an account?{" "}
          <Link
            to={registerPath}
            className="font-bold text-blue-600 hover:text-blue-700 ml-1"
          >
            Register here
          </Link>
        </p>
      </div>
    </form>
  );
};
