import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MapPin,
  Brain,
  CheckCircle2,
  Users,
  Building2,
  Landmark,
  GraduationCap,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Shield,
  Cpu,
  Globe,
  Zap,
} from "lucide-react";

const stats = [
  { value: "1,245", label: "Challenges Reported", suffix: "" },
  { value: "75", label: "Active Solutions", suffix: "" },
  { value: "32", label: "Universities Connected", suffix: "" },
  { value: "15,000", label: "Citizens Impacted", suffix: "+" },
];

const steps = [
  { id: "01", label: "REPORT", desc: "Citizens describe real problems affecting their communities using our guided AI-powered form.", icon: MapPin, color: "#0B63F6" },
  { id: "02", label: "AI ANALYSIS", desc: "CivicAI categorizes, detects duplicates, and calculates a priority score in seconds.", icon: Brain, color: "#00C2FF" },
  { id: "03", label: "VALIDATION", desc: "Government officers review AI insights and officially validate high-priority challenges.", icon: Shield, color: "#10B981" },
  { id: "04", label: "UNIVERSITY MATCH", desc: "AI finds the best university based on expertise, capacity, and domain alignment.", icon: GraduationCap, color: "#8B5CF6" },
  { id: "05", label: "COLLABORATE", desc: "Faculty, students, and industry partners form interdisciplinary project teams.", icon: Users, color: "#F59E0B" },
  { id: "06", label: "DEPLOY", desc: "Solutions are piloted in the affected communities with live monitoring.", icon: Cpu, color: "#EF4444" },
  { id: "07", label: "MEASURE IMPACT", desc: "Real-time dashboards track citizen satisfaction and measurable societal outcomes.", icon: TrendingUp, color: "#10B981" },
];

const journey = [
  { icon: MapPin, label: "Srivilliputhur", sub: "Citizen Reports Problem", color: "#0B63F6" },
  { icon: Brain, label: "CivicAI", sub: "Analyzes Challenge", color: "#00C2FF" },
  { icon: Landmark, label: "Validated", sub: "Government Approval", color: "#10B981" },
  { icon: GraduationCap, label: "University Matched", sub: "94% Compatibility", color: "#8B5CF6" },
  { icon: Users, label: "Team Formed", sub: "12 Students + 2 Faculty", color: "#F59E0B" },
  { icon: Briefcase, label: "Industry Support", sub: "IoT Partner Joined", color: "#EF4444" },
  { icon: Globe, label: "Pilot Deployed", sub: "3 Villages", color: "#10B981" },
  { icon: TrendingUp, label: "Impact Measured", sub: "2,500 Citizens Benefited", color: "#00C2FF" },
];

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

export default function Landing() {
  const [activeStep, setActiveStep] = useState(0);
  const [visibleStats, setVisibleStats] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setVisibleStats(true);
      },
      { threshold: 0.2 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden network-bg pt-20">
        {/* Animated SVG network */}
        <svg
          className="absolute inset-0 w-full h-full opacity-30"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0B63F6" stopOpacity="0" />
              <stop offset="50%" stopColor="#00C2FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0B63F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[
            [200, 150, 650, 300],
            [650, 300, 1000, 200],
            [650, 300, 700, 550],
            [200, 150, 400, 400],
            [400, 400, 700, 550],
            [1000, 200, 950, 500],
            [700, 550, 950, 500],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#lineGrad)" strokeWidth="1.5" />
          ))}
          {[
            [200, 150, 6, "#0B63F6", 0],
            [650, 300, 10, "#00C2FF", 1],
            [1000, 200, 5, "#10B981", 2],
            [400, 400, 7, "#8B5CF6", 3],
            [700, 550, 8, "#0B63F6", 4],
            [950, 500, 5, "#00C2FF", 5],
          ].map(([x, y, r, color, delay]) => (
            <AnimatedNode
              key={delay as number}
              x={x as number}
              y={y as number}
              r={r as number}
              color={color as string}
              delay={delay as number}
            />
          ))}
        </svg>

        {/* Floating stat cards */}
        <div className="absolute top-36 left-8 md:left-16 glass-card rounded-2xl p-4 float hidden md:block">
          <div className="text-2xl font-bold text-[#071A33]" style={{ fontFamily: "var(--font-display)" }}>
            1,245
          </div>
          <div className="text-xs text-gray-500 mt-1">Challenges Reported</div>
        </div>
        <div className="absolute top-52 right-8 md:right-16 glass-card rounded-2xl p-4 float-delay-1 hidden md:block">
          <div className="text-2xl font-bold text-blue-600" style={{ fontFamily: "var(--font-display)" }}>
            75
          </div>
          <div className="text-xs text-gray-500 mt-1">Active Solutions</div>
        </div>
        <div className="absolute bottom-32 left-16 glass-card rounded-2xl p-4 float-delay-2 hidden md:block">
          <div className="text-2xl font-bold text-emerald-600" style={{ fontFamily: "var(--font-display)" }}>
            15,000+
          </div>
          <div className="text-xs text-gray-500 mt-1">Citizens Impacted</div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6 py-12">
          <div
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-xs font-semibold tracking-widest uppercase"
            style={{
              background: "rgba(11,99,246,0.08)",
              border: "1px solid rgba(11,99,246,0.2)",
              color: "#0B63F6",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 pulse-glow"></span>
            SMART INDIA HACKATHON 2026 · CROWDSOURCING & COLLABORATION PLATFORM
          </div>

          <h1
            className="text-5xl md:text-7xl font-extrabold text-[#071A33] leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Every Problem Deserves<br />
            <span className="gradient-text">A Path to a Solution.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            UniBridge connects citizen-reported societal challenges with universities, student innovators, industry partners, and government leadership to engineer, deploy, and scale real solutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/roles"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl text-base font-bold text-white shadow-md hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0B63F6 0%, #00C2FF 100%)" }}
            >
              Get Started · Choose Role
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/auth/citizen/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-base font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all inline-flex items-center justify-center"
            >
              Report a Challenge
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400">
          <span className="text-[10px] font-bold tracking-widest">EXPLORE</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-300 to-transparent"></div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section ref={statsRef} className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div
              key={i}
              className={`text-center transition-all duration-700 ${
                visibleStats ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div
                className="text-4xl md:text-5xl font-extrabold mb-1"
                style={{
                  fontFamily: "var(--font-display)",
                  background: "linear-gradient(135deg, #0B63F6, #00C2FF)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {s.value}
                {s.suffix}
              </div>
              <div className="text-sm text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{ background: "rgba(11,99,246,0.08)", color: "#0B63F6" }}
            >
              THE ARCHITECTURE
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold mb-4 text-[#071A33]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              How UniBridge Works
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              From a citizen's voice in a remote village to a deployed national solution — every stage orchestrated by AI.
            </p>
          </div>

          {/* Step pills */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-12">
            {steps.map((s, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all duration-300 cursor-pointer ${
                  activeStep === i ? "text-white scale-105 shadow-sm" : "text-gray-600 hover:text-gray-900 bg-gray-50 border border-gray-200"
                }`}
                style={
                  activeStep === i
                    ? { background: s.color, boxShadow: `0 0 20px ${s.color}40` }
                    : {}
                }
              >
                {s.id} · {s.label}
              </button>
            ))}
          </div>

          {/* Active step detail */}
          <div
            className="rounded-3xl p-8 md:p-12 transition-all duration-500 bg-slate-50 border border-gray-200"
          >
            {steps.map(
              (s, i) =>
                i === activeStep && (
                  <div key={i} className="flex flex-col md:flex-row items-center gap-8">
                    <div
                      className="flex-shrink-0 w-20 h-20 rounded-2xl flex items-center justify-center shadow-xs"
                      style={{ background: `${s.color}15`, border: `2px solid ${s.color}` }}
                    >
                      <s.icon size={36} style={{ color: s.color }} />
                    </div>
                    <div>
                      <div
                        className="text-xs font-bold tracking-widest mb-2"
                        style={{ color: s.color }}
                      >
                        STEP {s.id} / {steps.length.toString().padStart(2, "0")}
                      </div>
                      <h3
                        className="text-2xl md:text-3xl font-extrabold mb-3 text-[#071A33]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {s.label}
                      </h3>
                      <p className="text-gray-600 text-base md:text-lg max-w-xl leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                    <div className="ml-auto flex gap-2">
                      {i > 0 && (
                        <button
                          onClick={() => setActiveStep(i - 1)}
                          className="p-3 rounded-xl text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer"
                        >
                          ←
                        </button>
                      )}
                      {i < steps.length - 1 && (
                        <button
                          onClick={() => setActiveStep(i + 1)}
                          className="p-3 rounded-xl text-gray-800 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-100 transition-all cursor-pointer"
                        >
                          →
                        </button>
                      )}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </section>

      {/* Signature Feature: Journey of One Problem */}
      <section className="py-24 bg-slate-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase"
              style={{ background: "rgba(0,194,255,0.1)", color: "#0B63F6" }}
            >
              SIGNATURE LIFECYCLE
            </div>
            <h2
              className="text-3xl md:text-5xl font-extrabold mb-4 text-[#071A33]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              The Journey of One Problem
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm md:text-base">
              Follow a real challenge from a Tamil Nadu farmer through the entire UniBridge collaborative engine.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {journey.map((j, i) => (
              <div key={i} className="relative">
                <div className="glass-card rounded-2xl p-5 flex flex-col items-center text-center hover:shadow-md transition-all duration-300 group">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                    style={{ background: `${j.color}15`, border: `1px solid ${j.color}40` }}
                  >
                    <j.icon size={22} style={{ color: j.color }} />
                  </div>
                  <div className="text-xs font-bold text-gray-400 tracking-widest mb-1">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div
                    className="text-sm font-bold mb-1 text-[#071A33]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {j.label}
                  </div>
                  <div className="text-xs text-gray-500">{j.sub}</div>
                </div>
                {i < journey.length - 1 && (
                  <div className="hidden md:flex absolute top-1/2 -right-2 z-10 items-center justify-center w-4 pointer-events-none">
                    <ChevronRight size={14} className="text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Real Challenge Highlight Card */}
          <div
            className="mt-12 rounded-3xl p-8 bg-white border border-gray-200 shadow-xs"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <div className="text-xs font-bold text-blue-600 tracking-widest mb-2 uppercase">
                  VERIFIED IMPACT CASE STUDY
                </div>
                <h3
                  className="text-xl md:text-2xl font-bold mb-2 text-[#071A33]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  "Farmers are losing 35% of vegetables because there is no micro-cold storage facility."
                </h3>
                <p className="text-gray-500 text-sm">
                  — Reported by Murugesan K., Srivilliputhur, Tamil Nadu · Matched to Kalasalingam Academy & CoolTech India
                </p>
              </div>

              <div className="flex flex-wrap gap-3 flex-shrink-0">
                <div
                  className="text-center px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200"
                >
                  <div
                    className="text-2xl font-extrabold text-rose-600"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    89/100
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">Priority Score</div>
                </div>
                <div
                  className="text-center px-4 py-3 rounded-2xl bg-blue-50 border border-blue-200"
                >
                  <div
                    className="text-2xl font-extrabold text-blue-600"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    94%
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">AI Univ. Match</div>
                </div>
                <div
                  className="text-center px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200"
                >
                  <div
                    className="text-2xl font-extrabold text-emerald-600"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    4,500+
                  </div>
                  <div className="text-[11px] text-gray-500 font-medium">Farmers Benefited</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role CTA Section */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2
            className="text-3xl md:text-5xl font-extrabold mb-4 text-[#071A33]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            How Will You Shape Change?
          </h2>
          <p className="text-gray-500 mb-12 max-w-xl mx-auto text-sm md:text-base">
            Choose your role in India's premier collaborative innovation ecosystem.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Users,
                label: "Citizen",
                desc: "Report issues & track solutions",
                color: "#0B63F6",
                link: "/auth/citizen/login",
              },
              {
                icon: GraduationCap,
                label: "University & Students",
                desc: "Research, design & build prototypes",
                color: "#8B5CF6",
                link: "/auth/university/login",
              },
              {
                icon: Briefcase,
                label: "Industry Partner",
                desc: "Fund, mentor & provide tech",
                color: "#F59E0B",
                link: "/auth/industry/login",
              },
              {
                icon: Landmark,
                label: "Government",
                desc: "Validate, monitor & scale impact",
                color: "#10B981",
                link: "/auth/government/login",
              },
            ].map((r, i) => (
              <Link
                key={i}
                to={r.link}
                className="group p-6 rounded-3xl text-left transition-all duration-300 hover:scale-105 hover:shadow-xl bg-slate-50 border border-gray-200 flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                    style={{ background: `${r.color}15`, border: `1px solid ${r.color}30` }}
                  >
                    <r.icon size={22} style={{ color: r.color }} />
                  </div>
                  <div
                    className="font-bold text-lg text-[#071A33] mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {r.label}
                  </div>
                  <div className="text-xs text-gray-500 mb-6 leading-relaxed">{r.desc}</div>
                </div>

                <div
                  className="flex items-center gap-1.5 text-xs font-bold"
                  style={{ color: r.color }}
                >
                  Enter Workspace <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0B63F6, #00C2FF)" }}
            >
              <Zap size={14} className="text-white" />
            </div>
            <span
              className="font-bold text-[#071A33]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              UniBridge · SIH 2026
            </span>
          </div>
          <p className="text-gray-500 text-xs text-center md:text-left">
            From Citizen Problems to National Solutions. Smart India Hackathon Platform.
          </p>
          <div className="text-gray-400 text-xs font-mono">CivicAI Engine v2.6</div>
        </div>
      </footer>
    </div>
  );
}
