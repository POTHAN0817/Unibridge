import { useState } from "react";
import { Users, GraduationCap, Briefcase, Landmark, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Page, Role } from "../types";

interface RoleSelectProps {
  onSelect: (role: Role, page: Page) => void;
  onBack?: () => void;
}

const roles = [
  {
    id: "citizen" as Role,
    icon: Users,
    label: "Citizen",
    tagline: "Your voice drives change.",
    desc: "Report challenges affecting your community. Track your submissions as they move through the innovation pipeline.",
    color: "#0B63F6",
    gradient: "linear-gradient(135deg, #0B63F6 0%, #00C2FF 100%)",
    page: "citizen-dashboard" as Page,
    features: ["Report problems", "Track progress", "Measure impact"],
  },
  {
    id: "university" as Role,
    icon: GraduationCap,
    label: "University, Faculty & Students",
    tagline: "Transform problems into projects.",
    desc: "Browse AI-recommended challenges, form interdisciplinary student/faculty teams, and build real-world solutions.",
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)",
    page: "university-dashboard" as Page,
    features: ["AI challenge matching", "Faculty & student teams", "Build & deploy solutions"],
  },
  {
    id: "industry" as Role,
    icon: Briefcase,
    label: "Industry Partner",
    tagline: "Where expertise creates impact.",
    desc: "Support university-led innovation through mentorship, funding, technology, and pilot infrastructure.",
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)",
    page: "gov-command" as Page,
    features: ["Fund projects", "Provide technology", "Support pilots"],
  },
  {
    id: "government" as Role,
    icon: Landmark,
    label: "Government",
    tagline: "Monitor. Validate. Scale.",
    desc: "Oversee the national innovation pipeline, validate challenges, and track measurable societal impact.",
    color: "#10B981",
    gradient: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
    page: "gov-command" as Page,
    features: ["Validate challenges", "Monitor solutions", "Measure national impact"],
  },
];

export default function RoleSelect({ onSelect, onBack }: RoleSelectProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-6xl w-full mb-4">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer border border-gray-200"
          >
            <ArrowLeft size={16} /> Back
          </button>
        )}
      </div>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 mb-5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest" style={{ background: "rgba(11,99,246,0.08)", color: "#0B63F6" }}>
          CHOOSE YOUR ROLE
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>
          How Will You<br />
          <span className="gradient-text">Shape Change Today?</span>
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto">Select your role to enter your personalized workspace within the CivicForge ecosystem.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl w-full">
        {roles.map((role) => (
          <button
            key={role.id}
            onMouseEnter={() => setHovered(role.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => {
              setSelected(role.id);
              setTimeout(() => onSelect(role.id, role.page), 300);
            }}
            className="group relative p-6 rounded-2xl text-left transition-all duration-300 overflow-hidden cursor-pointer"
            style={{
              background: hovered === role.id || selected === role.id
                ? `#FFFFFF`
                : "#F8FAFC",
              border: `1.5px solid ${hovered === role.id || selected === role.id ? role.color : "rgba(11,99,246,0.1)"}`,
              transform: hovered === role.id ? "translateY(-4px)" : "translateY(0)",
              boxShadow: hovered === role.id ? `0 12px 30px ${role.color}20` : "0 2px 10px rgba(7,26,51,0.03)",
            }}
          >
            {selected === role.id && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-20">
                <CheckCircle2 size={32} style={{ color: role.color }} />
              </div>
            )}

            {/* Gradient accent top */}
            <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-opacity duration-300" style={{ background: role.gradient, opacity: hovered === role.id ? 1 : 0 }}></div>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110" style={{ background: `${role.color}15`, border: `1px solid ${role.color}30` }}>
              <role.icon size={22} style={{ color: role.color }} />
            </div>

            <div className="text-xs font-bold tracking-widest mb-1" style={{ color: role.color }}>{role.label}</div>
            <h3 className="text-lg font-bold mb-2" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>{role.tagline}</h3>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">{role.desc}</p>

            <ul className="space-y-2 mb-6">
              {role.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: role.color }}></div>
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 text-sm font-semibold transition-all duration-300 group-hover:gap-3" style={{ color: role.color }}>
              Enter Workspace
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

