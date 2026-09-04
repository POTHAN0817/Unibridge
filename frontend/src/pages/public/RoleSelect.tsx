import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, GraduationCap, Briefcase, Landmark, ArrowRight, ArrowLeft, LogIn, UserPlus } from "lucide-react";
import { UserRole } from "../../types";

const rolesConfig = [
  {
    id: "citizen" as UserRole,
    icon: Users,
    label: "Citizen",
    tagline: "Your voice drives change.",
    desc: "Report challenges affecting your community, track submissions, and follow real-time solutions.",
    color: "#0B63F6",
    gradient: "linear-gradient(135deg, #0B63F6 0%, #00C2FF 100%)",
    loginPath: "/auth/citizen/login",
    registerPath: "/auth/citizen/register",
    features: ["Report community problems", "Track solution progress", "Witness measurable impact"],
  },
  {
    id: "university" as UserRole,
    icon: GraduationCap,
    label: "University / Faculty / Student",
    tagline: "Transform problems into projects.",
    desc: "Browse AI-matched challenges, form interdisciplinary research teams, and build impactful prototypes.",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
    loginPath: "/auth/university/login",
    registerPath: "/auth/university/register",
    features: ["AI challenge matching", "Faculty & student teams", "Build & deploy live pilots"],
  },
  {
    id: "industry" as UserRole,
    icon: Briefcase,
    label: "Industry Partner",
    tagline: "Where expertise creates impact.",
    desc: "Support university innovations through engineering mentorship, seed funding, and technology infrastructure.",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
    loginPath: "/auth/industry/login",
    registerPath: "/auth/industry/register",
    features: ["Fund university prototypes", "Provide IoT / Cloud tech", "Scale validated pilots"],
  },
  {
    id: "government" as UserRole,
    icon: Landmark,
    label: "Government Official",
    tagline: "Monitor. Validate. Scale.",
    desc: "Oversee the national innovation pipeline, validate critical challenges, and allocate resources.",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    loginPath: "/auth/government/login",
    registerPath: "/auth/government/register",
    features: ["Validate local challenges", "Monitor solutions in real time", "Scale statewide impact"],
  },
];

export default function RoleSelect() {
  const [hovered, setHovered] = useState<string | null>(null);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-4 sm:px-6 py-16">
      <div className="max-w-6xl mx-auto w-full mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all border border-gray-200 shadow-xs"
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      <div className="text-center mb-12 max-w-2xl mx-auto">
        <div
          className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase"
          style={{ background: "rgba(11,99,246,0.08)", color: "#0B63F6" }}
        >
          SELECT YOUR COLLABORATION ROLE
        </div>
        <h1
          className="text-3xl md:text-5xl font-extrabold text-[#071A33] tracking-tight mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          How Will You <br />
          <span className="gradient-text">Shape Change Today?</span>
        </h1>
        <p className="text-gray-500 text-sm md:text-base leading-relaxed">
          UniBridge connects citizens, universities, industry, and government into a single collaborative loop.
          Choose your role to sign in or create an account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto w-full">
        {rolesConfig.map((role) => (
          <div
            key={role.id}
            onMouseEnter={() => setHovered(role.id)}
            onMouseLeave={() => setHovered(null)}
            className="group relative flex flex-col justify-between p-6 rounded-2xl transition-all duration-300 bg-white border"
            style={{
              borderColor: hovered === role.id ? role.color : "rgba(11,99,246,0.12)",
              transform: hovered === role.id ? "translateY(-4px)" : "translateY(0)",
              boxShadow:
                hovered === role.id
                  ? `0 14px 30px ${role.color}18`
                  : "0 2px 10px rgba(7,26,51,0.03)",
            }}
          >
            {/* Gradient accent top line */}
            <div
              className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl transition-opacity duration-300"
              style={{ background: role.gradient, opacity: hovered === role.id ? 1 : 0.6 }}
            />

            <div>
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                style={{ background: `${role.color}15`, color: role.color }}
              >
                <role.icon size={24} />
              </div>

              <div
                className="text-xs font-bold tracking-widest uppercase mb-1"
                style={{ color: role.color }}
              >
                {role.label}
              </div>

              <h3
                className="text-lg font-bold text-[#071A33] mb-2"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {role.tagline}
              </h3>

              <p className="text-xs text-gray-500 leading-relaxed mb-5">{role.desc}</p>

              {/* Key capabilities */}
              <ul className="space-y-2 mb-6 border-t border-gray-100 pt-4">
                {role.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: role.color }} />
                    {feat}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions: Sign In & Register */}
            <div className="space-y-2 pt-2">
              <Link
                to={role.loginPath}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:opacity-95"
                style={{ background: role.color }}
              >
                <LogIn size={14} /> Sign In
              </Link>
              <Link
                to={role.registerPath}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all"
              >
                <UserPlus size={14} /> Create Account
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
