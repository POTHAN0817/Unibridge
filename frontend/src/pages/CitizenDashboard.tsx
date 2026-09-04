import { useState } from "react";
import { MapPin, Clock, CheckCircle2, AlertCircle, TrendingUp, Eye, MessageSquare, Users, Brain, ArrowLeft } from "lucide-react";
import type { Page } from "../types";
import { useAuth } from "../auth/AuthContext";

interface Props {
  onNavigate: (page: Page) => void;
  onBack?: () => void;
}

const challenges = [
  {
    id: 1,
    title: "Lack of Cold Storage for Vegetable Farmers",
    category: "Agriculture",
    location: "Srivilliputhur, Tamil Nadu",
    status: "In Progress",
    priority: "HIGH",
    priorityScore: 89,
    similarReports: 23,
    assignedUniversity: "Kalasalingam Academy of Research & Education",
    progress: 65,
    stage: "Prototype Development",
    tags: ["Cold Chain", "IoT", "Agriculture"],
    affectedPeople: "4,500+",
    submittedDate: "Jul 12, 2026",
  },
  {
    id: 2,
    title: "Contaminated Drinking Water in Kovilpatti Villages",
    category: "Water & Sanitation",
    location: "Kovilpatti, Tamil Nadu",
    status: "Validated",
    priority: "HIGH",
    priorityScore: 92,
    similarReports: 31,
    assignedUniversity: null,
    progress: 30,
    stage: "Government Validation",
    tags: ["Water Quality", "Public Health"],
    affectedPeople: "8,200+",
    submittedDate: "Aug 3, 2026",
  },
  {
    id: 3,
    title: "No Digital Learning Infrastructure in Govt. Schools",
    category: "Education",
    location: "Dindigul District, Tamil Nadu",
    status: "Resolved",
    priority: "MEDIUM",
    priorityScore: 74,
    similarReports: 15,
    assignedUniversity: "Anna University",
    progress: 100,
    stage: "Impact Measured",
    tags: ["EdTech", "Digital Literacy"],
    affectedPeople: "1,200+",
    submittedDate: "May 5, 2026",
  },
  {
    id: 4,
    title: "Waste Accumulation Near Residential Areas",
    category: "Environment",
    location: "Madurai, Tamil Nadu",
    status: "Submitted",
    priority: "MEDIUM",
    priorityScore: 68,
    similarReports: 7,
    assignedUniversity: null,
    progress: 10,
    stage: "AI Analysis",
    tags: ["Waste Management", "Urban"],
    affectedPeople: "3,100+",
    submittedDate: "Sep 1, 2026",
  },
];

const statusColor: Record<string, string> = {
  "Submitted": "#F59E0B",
  "Validated": "#0B63F6",
  "In Progress": "#8B5CF6",
  "Resolved": "#10B981",
};

const timeline = [
  { event: "Your challenge assigned to KARE University", time: "2 days ago", type: "success" },
  { event: "23 similar reports merged with your submission", time: "5 days ago", type: "info" },
  { event: "Government validated your challenge — Priority: 89/100", time: "1 week ago", type: "success" },
  { event: "AI Analysis complete — Category: Agriculture, Confidence: 92%", time: "2 weeks ago", type: "ai" },
  { event: "Challenge submitted successfully", time: "Jul 12", type: "neutral" },
];

export default function CitizenDashboard({ onNavigate, onBack }: Props) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "in-progress" | "resolved">("all");

  const filtered = filter === "all" ? challenges : filter === "resolved" ? challenges.filter((c) => c.status === "Resolved") : challenges.filter((c) => c.status !== "Resolved" && c.status !== "Submitted");

  return (
    <div className="min-h-screen pt-16 bg-white" style={{ background: "#FFFFFF" }}>
      {/* Header banner */}
      <div className="px-6 pt-6 pb-6 bg-slate-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 transition-all mb-4 cursor-pointer shadow-sm"
            >
              <ArrowLeft size={16} /> Back
            </button>
          )}

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <p className="text-gray-500 text-xs font-bold tracking-widest mb-1">GOOD MORNING</p>
              <h1 className="text-3xl md:text-4xl font-extrabold" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>
                {user?.name || (user?.profile as Record<string, any>)?.full_name || "Citizen"} <span className="text-2xl">👋</span>
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {user?.district && user?.state ? `${user.district}, ${user.state} · ` : user?.state ? `${user.state} · ` : ""}Tracking local challenges & community outcomes
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              { label: "Challenges Submitted", value: "04", icon: AlertCircle, color: "#0B63F6" },
              { label: "In Progress", value: "02", icon: Clock, color: "#8B5CF6" },
              { label: "Resolved", value: "01", icon: CheckCircle2, color: "#10B981" },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-xl p-4 flex items-center gap-3">
                <s.icon size={20} style={{ color: s.color }} />
                <div>
                  <div className="text-2xl font-extrabold" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Challenge list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>Your Challenges</h2>
              <div className="flex gap-2">
                {[["all", "All"], ["in-progress", "Active"], ["resolved", "Resolved"]].map(([val, label]) => (
                  <button key={val} onClick={() => setFilter(val as typeof filter)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${filter === val ? "text-white" : "text-gray-500 hover:text-gray-700"}`} style={filter === val ? { background: "#0B63F6" } : { background: "#EBF1F8" }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filtered.map((c) => (
                <div key={c.id} className="rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group" style={{ background: "white", border: "1px solid rgba(11,99,246,0.12)" }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: "#EBF1F8", color: "#0B63F6" }}>{c.category}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.priority === "HIGH" ? "priority-high" : "priority-medium"}`}>{c.priority}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: `${statusColor[c.status]}15`, color: statusColor[c.status], border: `1px solid ${statusColor[c.status]}30` }}>{c.status}</span>
                      </div>
                      <h3 className="font-bold text-navy group-hover:text-electric transition-colors" style={{ color: "#071A33" }}>{c.title}</h3>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-2xl font-extrabold" style={{ color: c.priorityScore >= 80 ? "#EF4444" : "#F59E0B", fontFamily: "var(--font-display)" }}>{c.priorityScore}</div>
                      <div className="text-xs text-gray-400">AI Score</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin size={11} />{c.location}</span>
                    <span className="flex items-center gap-1"><Users size={11} />{c.similarReports} similar reports</span>
                    <span className="flex items-center gap-1"><TrendingUp size={11} />{c.affectedPeople} affected</span>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                      <span className="font-medium text-gray-600">{c.stage}</span>
                      <span>{c.progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${c.progress}%`, background: c.progress === 100 ? "#10B981" : "linear-gradient(90deg, #0B63F6, #00C2FF)" }}></div>
                    </div>
                  </div>

                  {c.assignedUniversity && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: "#8B5CF6" }}>
                      <Brain size={11} />
                      <span className="font-semibold">{c.assignedUniversity}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Activity timeline */}
          <div>
            <h2 className="text-xl font-bold mb-6" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>Activity Timeline</h2>
            <div className="space-y-1">
              {timeline.map((t, i) => (
                <div key={i} className="flex gap-3 pb-5">
                  <div className="flex flex-col items-center">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: t.type === "success" ? "#10B981" : t.type === "ai" ? "#00C2FF" : t.type === "info" ? "#0B63F6" : "#CBD5E1" }}></div>
                    {i < timeline.length - 1 && <div className="w-px flex-1 min-h-[20px] mt-1" style={{ background: "#E2E8F0" }}></div>}
                  </div>
                  <div>
                    <p className="text-sm text-gray-700 leading-relaxed">{t.event}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{t.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Info card */}
            <div className="mt-6 rounded-2xl p-6 text-center" style={{ background: "#F8FAFC", border: "1px solid rgba(11,99,246,0.1)" }}>
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center" style={{ background: "rgba(11,99,246,0.1)" }}>
                <MessageSquare size={20} className="text-blue-600" />
              </div>
              <h3 className="font-bold mb-2" style={{ color: "#071A33", fontFamily: "var(--font-display)" }}>Community Impact</h3>
              <p className="text-gray-500 text-xs">Every problem reported has the potential to become a national solution through CivicForge.</p>
            </div>

            {/* Impact card */}
            <div className="mt-4 rounded-2xl p-5" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Eye size={16} className="text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700">Your Impact</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-2xl font-extrabold text-emerald-600" style={{ fontFamily: "var(--font-display)" }}>4,500+</div>
                  <div className="text-xs text-emerald-700/60">People your reports could help</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-emerald-600" style={{ fontFamily: "var(--font-display)" }}>92%</div>
                  <div className="text-xs text-emerald-700/60">AI confidence on your submissions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
