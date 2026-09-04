import { useState } from "react";
import { CheckCircle2, Clock, Circle, Users, Brain, TrendingUp, Briefcase, ArrowLeft } from "lucide-react";

interface Props {
  onBack?: () => void;
}

const stages = [
  { label: "Challenge Identified", done: true },
  { label: "University Assigned", done: true },
  { label: "Team Formed", done: true },
  { label: "Solution Design", done: true },
  { label: "Prototype Development", active: true, done: false },
  { label: "Pilot Deployment", done: false },
  { label: "Impact Measurement", done: false },
];

const tabs = ["Overview", "Team", "Milestones", "Documents", "Industry Support", "Impact"];

const teamMembers = [
  { name: "Dr. Anjali Kumar", role: "Faculty Mentor", domain: "Agricultural Engineering", avatar: "AK", color: "#0B63F6" },
  { name: "Prof. Rajan Suresh", role: "Co-Mentor", domain: "IoT Systems", avatar: "RS", color: "#8B5CF6" },
  { name: "Aarav Krishnan", role: "Lead Student", domain: "IoT Development", avatar: "AK", color: "#00C2FF" },
  { name: "Priya Venkat", role: "Student", domain: "Data Science", avatar: "PV", color: "#10B981" },
  { name: "Rahul Mohan", role: "Student", domain: "Mechanical Design", avatar: "RM", color: "#F59E0B" },
  { name: "Kavya Sridhar", role: "Student", domain: "Supply Chain", avatar: "KS", color: "#EF4444" },
];

const milestones = [
  { title: "Project charter signed", date: "Jul 15, 2026", done: true },
  { title: "Literature review complete", date: "Aug 1, 2026", done: true },
  { title: "IoT sensor prototype built", date: "Aug 22, 2026", done: true },
  { title: "Cold chamber design finalized", date: "Sep 5, 2026", done: false, current: true },
  { title: "Village pilot site identified", date: "Sep 20, 2026", done: false },
  { title: "Pilot launch in 3 villages", date: "Oct 10, 2026", done: false },
  { title: "3-month impact report", date: "Jan 10, 2027", done: false },
];

const industrySupport = [
  { company: "CoolTech India Pvt. Ltd.", type: "Technology Partner", providing: "Refrigeration IoT hardware", status: "Active", logo: "CT" },
  { company: "AWS India", type: "Cloud Infrastructure", providing: "Cloud compute & storage", status: "Active", logo: "AW" },
  { company: "AgriFinance Corp", type: "Funding Partner", providing: "₹12L project grant", status: "Confirmed", logo: "AF" },
];

export default function ProjectWorkspace({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    <div className="min-h-screen pt-16 bg-white">
      {/* Project header */}
      <div className="px-6 py-6 border-b border-gray-100 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0B63F6] transition-colors mb-4 px-3 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:border-[#0B63F6]/30"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">AGRICULTURE</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">PILOT DEVELOPMENT</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#071A33] mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Smart Cold Chain for Rural Farmers
          </h1>
          <p className="text-gray-500 text-sm">Srivilliputhur, Tamil Nadu · Started Jul 15, 2026 · Kalasalingam Academy</p>

          {/* Progress timeline */}
          <div className="mt-6 overflow-x-auto pb-2">
            <div className="flex items-center gap-0 min-w-max">
              {stages.map((s, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${s.done ? "border-emerald-500 bg-emerald-50" : s.active ? "border-[#0B63F6] bg-blue-50" : "border-gray-300 bg-white"}`}>
                      {s.done ? <CheckCircle2 size={14} className="text-emerald-600" /> : s.active ? <div className="w-2.5 h-2.5 rounded-full bg-[#0B63F6]"></div> : <Circle size={14} className="text-gray-300" />}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${s.done ? "text-emerald-700 font-semibold" : s.active ? "text-[#0B63F6] font-bold" : "text-gray-400"}`}>{s.label}</span>
                  </div>
                  {i < stages.length - 1 && (
                    <div className="w-16 h-0.5 mx-1" style={{ background: s.done ? "#10B981" : "#E2E8F0" }}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-0 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex overflow-x-auto gap-0">
          {tabs.map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-5 py-4 text-sm font-bold whitespace-nowrap transition-all border-b-2 ${activeTab === t ? "border-[#0B63F6] text-[#0B63F6]" : "border-transparent text-gray-500 hover:text-gray-800"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview tab */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Summary */}
              <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-3 text-[#071A33]" style={{ fontFamily: "var(--font-display)" }}>Project Summary</h2>
                <p className="text-gray-600 leading-relaxed text-sm">
                  This project addresses post-harvest vegetable losses faced by farmers in Virudhunagar district due to the absence of affordable cold storage infrastructure. The solution involves a low-cost, solar-powered IoT-enabled cold chamber designed for village-level deployment. Three pilot sites have been identified in Srivilliputhur, Rajapalayam, and Sattur.
                </p>
              </div>

              {/* Key metrics */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Target Beneficiaries", value: "4,500+", color: "#0B63F6", icon: Users },
                  { label: "Solution Completion", value: "65%", color: "#10B981", icon: TrendingUp },
                  { label: "Industry Partners", value: "3", color: "#F59E0B", icon: Briefcase },
                ].map((m, i) => (
                  <div key={i} className="rounded-xl p-5 text-center bg-white border border-gray-200 shadow-xs">
                    <m.icon size={20} style={{ color: m.color }} className="mx-auto mb-2" />
                    <div className="text-2xl font-extrabold" style={{ color: m.color, fontFamily: "var(--font-display)" }}>{m.value}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">{m.label}</div>
                  </div>
                ))}
              </div>

              {/* AI recommendation */}
              <div className="rounded-2xl p-5 bg-blue-50/50 border border-blue-200">
                <div className="flex items-center gap-2 mb-3">
                  <Brain size={18} className="text-[#0B63F6]" />
                  <span className="text-xs font-bold text-[#0B63F6] uppercase tracking-wider">AI TEAM RECOMMENDATION</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Based on the challenge requirements, CivicAI recommends adding expertise in <strong>Supply Chain Optimization</strong>. Current team coverage in this domain is 54% — below the recommended threshold for pilot-scale deployment.
                </p>
                <button className="mt-3 px-4 py-2 rounded-lg text-xs font-bold text-[#0B63F6] hover:bg-blue-100/60 transition-colors bg-white border border-blue-200">
                  View Recommended Members →
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">CHALLENGE DETAILS</h3>
                <div className="space-y-3">
                  {[
                    { label: "AI Priority Score", val: "89/100", color: "#EF4444" },
                    { label: "Similar Reports", val: "23", color: "#0B63F6" },
                    { label: "Category", val: "Agriculture", color: "#10B981" },
                    { label: "Government Status", val: "Validated ✓", color: "#10B981" },
                  ].map((d, i) => (
                    <div key={i} className="flex justify-between text-sm py-2 border-b border-gray-100">
                      <span className="text-gray-500">{d.label}</span>
                      <span className="font-bold" style={{ color: d.color }}>{d.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl p-5 bg-white border border-gray-200 shadow-sm">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">NEXT MILESTONE</h3>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div>
                    <div className="font-semibold text-sm text-[#071A33]">Cold chamber design finalized</div>
                    <div className="text-xs text-gray-500">Due Sep 5, 2026</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team tab */}
        {activeTab === "Team" && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {teamMembers.map((m, i) => (
                <div key={i} className="rounded-2xl p-5 hover:shadow-md transition-all bg-white border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: m.color }}>
                      {m.avatar}
                    </div>
                    <div>
                      <div className="font-bold text-[#071A33]">{m.name}</div>
                      <div className="text-xs text-gray-500">{m.role}</div>
                    </div>
                  </div>
                  <div className="text-xs px-2.5 py-1 rounded-md font-medium inline-block bg-slate-100 text-slate-700">
                    {m.domain}
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-6 bg-blue-50/50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Brain size={18} className="text-[#0B63F6]" />
                <span className="font-bold text-[#0B63F6] text-xs uppercase tracking-wider">AI TEAM RECOMMENDATION</span>
              </div>
              <p className="text-gray-700 text-sm">Based on the challenge requirements, CivicAI recommends adding expertise in <strong>Supply Chain Optimization</strong>.</p>
              <button className="mt-3 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#0B63F6] hover:bg-blue-600 shadow-xs">
                View Recommended Members
              </button>
            </div>
          </div>
        )}

        {/* Milestones tab */}
        {activeTab === "Milestones" && (
          <div className="max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="space-y-1">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-4 pb-6">
                  <div className="flex flex-col items-center">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 ${m.done ? "border-emerald-500 bg-emerald-50" : m.current ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"}`}>
                      {m.done ? <CheckCircle2 size={16} className="text-emerald-600" /> : m.current ? <Clock size={16} className="text-blue-600" /> : <Circle size={16} className="text-gray-300" />}
                    </div>
                    {i < milestones.length - 1 && <div className="w-0.5 flex-1 min-h-[24px] mt-1" style={{ background: m.done ? "#10B981" : "#E2E8F0" }}></div>}
                  </div>
                  <div className="pb-2">
                    <div className={`font-semibold ${m.done ? "text-emerald-700" : m.current ? "text-[#0B63F6]" : "text-gray-500"}`}>{m.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{m.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Industry Support tab */}
        {activeTab === "Industry Support" && (
          <div className="space-y-4">
            {industrySupport.map((p, i) => (
              <div key={i} className="rounded-2xl p-6 hover:shadow-md transition-all bg-white border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 bg-[#0B63F6]">{p.logo}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[#071A33]">{p.company}</h3>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">{p.status}</span>
                    </div>
                    <div className="text-xs text-[#0B63F6] font-semibold mb-1">{p.type}</div>
                    <div className="text-sm text-gray-600">{p.providing}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Impact tab */}
        {activeTab === "Impact" && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-2xl p-8 bg-white border border-gray-200 shadow-sm">
              <h2 className="text-2xl font-extrabold text-[#071A33] mb-6" style={{ fontFamily: "var(--font-display)" }}>Smart Water Monitoring System</h2>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="text-center p-5 rounded-xl bg-red-50 border border-red-200">
                  <div className="text-xs font-bold text-red-600 tracking-widest mb-2 uppercase">BEFORE</div>
                  <div className="text-4xl font-extrabold text-red-700" style={{ fontFamily: "var(--font-display)" }}>7</div>
                  <div className="text-sm font-medium text-red-800/70 mt-1">Days to test water quality</div>
                </div>
                <div className="text-center p-5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-600 tracking-widest mb-2 uppercase">AFTER</div>
                  <div className="text-4xl font-extrabold text-emerald-700" style={{ fontFamily: "var(--font-display)" }}>1</div>
                  <div className="text-sm font-medium text-emerald-800/70 mt-1">Day to test water quality</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                {[
                  { label: "Citizens Benefited", value: "2,500", color: "#0B63F6" },
                  { label: "Satisfaction", value: "89%", color: "#10B981" },
                  { label: "Impact Score", value: "91/100", color: "#F59E0B" },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-2xl font-extrabold" style={{ color: s.color, fontFamily: "var(--font-display)" }}>{s.value}</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-bold text-emerald-700 tracking-wider mb-1 uppercase">REPLICATION POTENTIAL</div>
              <div className="text-2xl font-extrabold text-emerald-800 mb-2" style={{ fontFamily: "var(--font-display)" }}>HIGH</div>
              <p className="text-emerald-900/80 text-sm leading-relaxed">This solution can potentially be deployed across <strong>47 similar districts</strong> with comparable agricultural and water infrastructure challenges.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

