import { TrendingUp, Users, Globe, Award, ChevronRight, ArrowLeft } from "lucide-react";
import type { Page } from "../types";

interface Props {
  onNavigate: (page: Page) => void;
  onBack?: () => void;
}

const stories = [
  {
    title: "Smart Water Monitoring System",
    location: "Kovilpatti, Tamil Nadu",
    category: "Water & Sanitation",
    university: "Anna University",
    before: { metric: "7 DAYS", label: "Water testing time" },
    after: { metric: "1 DAY", label: "Water testing time" },
    impact: { benefited: "2,500", satisfaction: "89%", score: "91/100" },
    replication: { potential: "HIGH", districts: 47 },
    color: "#0B63F6",
  },
  {
    title: "Smart Cold Chain for Rural Farmers",
    location: "Srivilliputhur, Tamil Nadu",
    category: "Agriculture",
    university: "Kalasalingam Academy",
    before: { metric: "35%", label: "Post-harvest vegetable loss" },
    after: { metric: "8%", label: "Post-harvest vegetable loss" },
    impact: { benefited: "4,500", satisfaction: "94%", score: "89/100" },
    replication: { potential: "HIGH", districts: 63 },
    color: "#10B981",
  },
  {
    title: "Digital Classroom Initiative",
    location: "Dindigul, Tamil Nadu",
    category: "Education",
    university: "NIT Trichy",
    before: { metric: "0%", label: "Schools with digital access" },
    after: { metric: "78%", label: "Schools with digital access" },
    impact: { benefited: "1,200", satisfaction: "96%", score: "94/100" },
    replication: { potential: "VERY HIGH", districts: 112 },
    color: "#8B5CF6",
  },
];

export default function Impact({ onNavigate, onBack }: Props) {
  return (
    <div className="min-h-screen pt-16 bg-white">
      {/* Header */}
      <div className="px-6 py-12 text-center bg-slate-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          {onBack && (
            <div className="flex justify-start mb-4">
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0B63F6] transition-colors px-3 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:border-[#0B63F6]/30"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            </div>
          )}

          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <TrendingUp size={14} /> NATIONAL IMPACT REPORT · 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#071A33] mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Stories of Change
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto text-base">
            Real challenges. Real solutions. Measurable impact. Every number here represents a citizen whose life improved through CivicForge.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mt-10">
            {[
              { value: "15,000+", label: "Citizens Benefited", icon: Users, color: "#0B63F6" },
              { value: "34", label: "Deployed Solutions", icon: Globe, color: "#10B981" },
              { value: "32", label: "Universities Active", icon: Award, color: "#8B5CF6" },
              { value: "91/100", label: "Avg. Impact Score", icon: TrendingUp, color: "#F59E0B" },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 text-center shadow-xs">
                <s.icon size={20} style={{ color: s.color }} className="mx-auto mb-2" />
                <div className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stories */}
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        {stories.map((s, i) => (
          <div key={i} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 bg-white border border-gray-200">
            {/* Top banner */}
            <div className="px-6 py-5 flex flex-wrap items-center justify-between gap-3 bg-white" style={{ borderBottom: `3px solid ${s.color}` }}>
              <div>
                <div className="flex gap-2 mb-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B63F6] border border-blue-100">{s.category}</span>
                </div>
                <h2 className="text-xl font-extrabold text-[#071A33]" style={{ fontFamily: "var(--font-display)" }}>{s.title}</h2>
                <p className="text-gray-500 text-sm">{s.location} · {s.university}</p>
              </div>
            </div>

            <div className="p-6">
              {/* Before / After */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-xl p-5 text-center bg-red-50/60 border border-red-200">
                      <div className="text-xs font-bold text-red-600 tracking-widest mb-2 uppercase">BEFORE</div>
                      <div className="text-3xl font-extrabold text-red-700 mb-1" style={{ fontFamily: "var(--font-display)" }}>{s.before.metric}</div>
                      <div className="text-xs font-medium text-red-800/70">{s.before.label}</div>
                    </div>
                    <div className="rounded-xl p-5 text-center bg-emerald-50/60 border border-emerald-200">
                      <div className="text-xs font-bold text-emerald-600 tracking-widest mb-2 uppercase">AFTER</div>
                      <div className="text-3xl font-extrabold text-emerald-700 mb-1" style={{ fontFamily: "var(--font-display)" }}>{s.after.metric}</div>
                      <div className="text-xs font-medium text-emerald-800/70">{s.after.label}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Citizens Benefited", val: s.impact.benefited, color: s.color },
                      { label: "Satisfaction", val: s.impact.satisfaction, color: "#10B981" },
                      { label: "Impact Score", val: s.impact.score, color: "#F59E0B" },
                    ].map((m, j) => (
                      <div key={j} className="text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-xl font-extrabold" style={{ color: m.color, fontFamily: "var(--font-display)" }}>{m.val}</div>
                        <div className="text-xs text-gray-500 font-medium">{m.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Replication */}
                <div className="rounded-xl p-5 bg-emerald-50 border border-emerald-200 flex flex-col justify-center">
                  <div className="text-xs font-bold text-emerald-700 tracking-wider mb-2 uppercase">REPLICATION POTENTIAL</div>
                  <div className="text-2xl font-extrabold text-emerald-800 mb-3" style={{ fontFamily: "var(--font-display)" }}>{s.replication.potential}</div>
                  <p className="text-sm text-emerald-900/80 leading-relaxed">This solution can be deployed across <strong>{s.replication.districts} similar districts</strong> nationwide.</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="py-16 text-center px-6 bg-slate-50 border-t border-gray-200">
        <h2 className="text-3xl md:text-4xl font-extrabold text-[#071A33] mb-4" style={{ fontFamily: "var(--font-display)" }}>
          Your community has a challenge waiting to be solved.
        </h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto text-base">Join thousands of citizens helping build a smarter India — one challenge at a time.</p>
        <button onClick={() => onNavigate("role-select")} className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:bg-blue-600 bg-[#0B63F6] shadow-md">
          Join CivicForge <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

