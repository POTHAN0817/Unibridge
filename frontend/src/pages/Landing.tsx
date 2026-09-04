import { useState, useEffect } from "react";
import { ArrowRight, Users, Landmark, GraduationCap, Briefcase, ChevronRight } from "lucide-react";
import type { Page } from "../types";

interface LandingProps {
  onNavigate: (page: Page) => void;
}

const AnimatedNode = ({ x, y, r, color, delay }: { x: number; y: number; r: number; color: string; delay: number }) => {
  const [opacity, setOpacity] = useState(0.3);
  useEffect(() => {
    const interval = setInterval(() => {
      setOpacity((o) => (o === 0.3 ? 0.8 : 0.3));
    }, 1500 + delay * 300);
    return () => clearInterval(interval);
  }, [delay]);
  return <circle cx={x} cy={y} r={r} fill={color} opacity={opacity} style={{ transition: "opacity 0.8s ease" }} />;
};

export default function Landing({ onNavigate }: LandingProps) {
  return (
    <div className="min-h-screen bg-white" style={{ background: "#FFFFFF" }}>
      {/* Hero */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden network-bg pt-24 pb-16">
        {/* Animated SVG network */}
        <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B63F6" stopOpacity="0" />
              <stop offset="50%" stopColor="#00C2FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0B63F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[[200, 150, 650, 300], [650, 300, 1000, 200], [650, 300, 700, 550], [200, 150, 400, 400], [400, 400, 700, 550], [1000, 200, 950, 500], [700, 550, 950, 500]].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#lineGrad)" strokeWidth="1.5" />
          ))}
          {[[200, 150, 6, "#0B63F6", 0], [650, 300, 10, "#00C2FF", 1], [1000, 200, 5, "#10B981", 2], [400, 400, 7, "#8B5CF6", 3], [700, 550, 8, "#0B63F6", 4], [950, 500, 5, "#00C2FF", 5]].map(([x, y, r, color, delay]) => (
            <AnimatedNode key={delay as number} x={x as number} y={y as number} r={r as number} color={color as string} delay={delay as number} />
          ))}
        </svg>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-12">
          <h1 className="text-5xl md:text-7xl font-extrabold text-navy leading-[1.05] mb-6" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>
            Every Problem Deserves<br />
            <span className="gradient-text">A Path to a Solution.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            UniBridge connects citizen-reported societal challenges with universities, student innovators, industry partners, and government leadership to engineer, deploy, and scale real solutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => onNavigate("role-select")}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold text-white shadow-md hover:scale-105 transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #0B63F6 0%, #00C2FF 100%)" }}
            >
              Get Started · Choose Role
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => onNavigate("report-challenge")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all inline-flex items-center justify-center cursor-pointer"
            >
              Report a Challenge
            </button>
          </div>
        </div>
      </section>

      {/* Role CTA */}
      <section className="py-20 bg-slate-50 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "var(--font-display)", color: "#071A33" }}>How Will You Shape Change?</h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto">Join as a citizen, university, industry partner, or government officer and become part of India's innovation ecosystem.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users, label: "Citizen", desc: "Report challenges", color: "#0B63F6", page: "citizen-dashboard" },
              { icon: GraduationCap, label: "University & Students", desc: "Solve real problems", color: "#8B5CF6", page: "university-dashboard" },
              { icon: Briefcase, label: "Industry Partner", desc: "Fund & support", color: "#F59E0B", page: "gov-command" },
              { icon: Landmark, label: "Government", desc: "Monitor impact", color: "#10B981", page: "gov-command" },
            ].map((r, i) => (
              <button
                key={i}
                onClick={() => onNavigate(r.page as Page)}
                className="group p-6 rounded-2xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-white border border-gray-200"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ background: `${r.color}15`, border: `1px solid ${r.color}30` }}>
                  <r.icon size={20} style={{ color: r.color }} />
                </div>
                <div className="font-bold text-navy mb-1" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>{r.label}</div>
                <div className="text-xs text-gray-500 mb-4">{r.desc}</div>
                <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: r.color }}>
                  Enter Workspace <ChevronRight size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
