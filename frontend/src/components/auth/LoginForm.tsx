import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, AlertCircle } from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { UserRole } from "../../types";

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

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isLoading) return;

    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    if (!password) {
      setErrorMessage("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login({
        email: trimmedEmail,
        password,
        role,
      });

      if (result.success) {
        // Redirection based on role
        navigate(`/${role}/dashboard`, { replace: true });
      } else {
        setErrorMessage(result.error || "Invalid email or password.");
      }
    } catch (err: any) {
      console.error("[UniBridge Login] Error during submit:", err);
      if (err.message && err.message.includes("Unable to connect")) {
        setErrorMessage("Unable to connect to UniBridge backend. Please check your network or verify the server is running.");
      } else {
        setErrorMessage("Something went wrong. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isBusy = isLoading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-start gap-2 animate-in fade-in duration-200"
        >
          <AlertCircle size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
          <div className="leading-snug">{errorMessage}</div>
        </div>
      )}

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
            autoComplete="email"
            disabled={isBusy}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@domain.com"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-all disabled:opacity-60"
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
              alert("Password recovery is handled via official institutional email verification.");
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
            autoComplete="current-password"
            disabled={isBusy}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-gray-900 bg-slate-50 border border-gray-200 focus:bg-white focus:border-blue-600 focus:outline-none transition-all disabled:opacity-60"
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={rememberMe}
            disabled={isBusy}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-600">Keep me signed in</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={isBusy}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
        style={{ background: submitButtonColor }}
      >
        {isBusy ? (
          <>
            <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Signing in...</span>
          </>
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
