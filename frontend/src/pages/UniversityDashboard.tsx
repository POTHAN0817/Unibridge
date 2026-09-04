import { useState } from "react";
import { Brain, MapPin, Users, TrendingUp, Clock, ChevronRight, Star, Zap, ArrowLeft, BookOpen, Award, Layers } from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import type { Page } from "../types";

interface Props {
  onNavigate: (page: Page) => void;
  onBack?: () => void;
}

const challenges = [
  {
    id: 1,
    title: "Smart Cold Chain for Rural Farmers",
    category: "Agriculture",
    location: "Virudhunagar, Tamil Nadu",
    priority: 89,
    match: 94,
    expertise: ["Agricultural Engineering", "IoT Research", "Cold Storage Research"],
    affected: "4,500+",
    status: "Recommended",
    radarData: [
      { subject: "Agriculture", value: 98 },
      { subject: "IoT", value: 91 },
      { subject: "Cold Chain", value: 87 },
      { subject: "Capacity", value: 78 },
      { subject: "Location", value: 82 },
    ],
  },
  {
    id: 2,
    title: "AI-Driven Water Quality Monitoring",
    category: "Water & Sanitation",
    location: "Kovilpatti, Tamil Nadu",
    priority: 92,
    match: 88,
    expertise: ["Water Treatment", "Sensor Networks", "Data Analytics"],
    affected: "8,200+",
    status: "Recommended",
    radarData: [
      { subject: "Water Tech", value: 90 },
      { subject: "Sensors", value: 85 },
      { subject: "Data", value: 88 },
      { subject: "Capacity", value: 74 },
      { subject: "Location", value: 79 },
    ],
  },
  {
    id: 3,
    title: "Remote Healthcare Connectivity Platform",
    category: "Healthcare",
    location: "Theni, Tamil Nadu",
    priority: 85,
    match: 81,
    expertise: ["Telemedicine", "Mobile Health", "Rural Health Systems"],
    affected: "12,000+",
    status: "New",
    radarData: [
      { subject: "Healthcare", value: 82 },
      { subject: "Mobile", value: 88 },
      { subject: "Connectivity", value: 76 },
      { subject: "Capacity", value: 65 },
      { subject: "Location", value: 70 },
    ],
  },
];

const activeProjects = [
  { title: "Smart Water Monitoring System", stage: "Pilot Deployment", progress: 78, team: 8, impact: "2,500 citizens" },
  { title: "Digital Classroom Initiative", stage: "Impact Measurement", progress: 95, team: 5, impact: "1,200 students" },
  { title: "Waste Smart Segregation AI", stage: "Prototype", progress: 42, team: 6, impact: "3,100 residents" },
];

const facultyTeams = [
  { mentor: "Dr. Anjali Kumar", dept: "Agricultural Engineering", leadStudent: "Aarav Krishnan", members: 8, project: "Smart Cold Chain for Rural Farmers", status: "Active Pilot" },
  { mentor: "Prof. Rajan Suresh", dept: "IoT & Embedded Systems", leadStudent: "Priya Venkat", members: 6, project: "AI Water Quality Monitoring", status: "Prototyping" },
  { mentor: "Dr. Meera Nair", dept: "Computer Science & AI", leadStudent: "Rahul Mohan", members: 5, project: "Remote Healthcare Platform", status: "Research" },
];

export default function UniversityDashboard({ onNavigate, onBack }: Props) {
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(0);
  const [tab, setTab] = useState<"recommended" | "active" | "faculty">("recommended");

  const challenge = challenges[selectedChallenge ?? 0];

  return (
    <div className="min-h-screen pt-16 bg-white">
      {/* Header */}
      <div className="px-6 py-6 border-b border-gray-100 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-[#0B63F6] transition-colors mb-4 px-3 py-1.5 rounded-lg border border-gray-200 bg-white shadow-sm hover:border-[#0B63F6]/30 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          )}

          <div className="text-xs font-bold tracking-widest text-[#0B63F6] mb-2 uppercase">
            KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#071A33] mb-6" style={{ fontFamily: "var(--font-display)" }}>
            University Innovation & Faculty Command Center
          </h1>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Recommended Challenges", value: "12", icon: Brain, color: "#0B63F6" },
              { label: "Active Projects", value: "08", icon: Zap, color: "#10B981" },
              { label: "Faculty & Students", value: "46", icon: Users, color: "#8B5CF6" },
              { label: "Impact Score", value: "87", icon: TrendingUp, color: "#F59E0B" },
            ].map((s, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-xs">
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <s.icon size={20} style={{ color: s.color }} />
                </div>
                <div>
                  <div className="text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)", color: s.color }}>{s.value}</div>
                  <div className="text-xs font-medium text-gray-500">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            ["recommended", "AI Recommendations"],
            ["active", "Active Projects"],
            ["faculty", "Faculty & Student Teams"]
          ].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTab(val as typeof tab)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                tab === val ? "text-white shadow-sm" : "text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-transparent"
              }`}
              style={tab === val ? { background: "#0B63F6" } : undefined}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "recommended" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Challenge list */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">AI-MATCHED CHALLENGES</h2>
              {challenges.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedChallenge(i)}
                  className="w-full text-left rounded-2xl p-5 transition-all duration-200 bg-white hover:border-[#0B63F6] cursor-pointer"
                  style={{
                    border: `2px solid ${selectedChallenge === i ? "#0B63F6" : "rgba(226, 232, 240, 0.8)"}`,
                    boxShadow: selectedChallenge === i ? "0 4px 12px rgba(11, 99, 246, 0.08)" : "none"
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0B63F6] border border-blue-100">
                          {c.category}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {c.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[#071A33]">{c.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-gray-400" />{c.location}</span>
                    <span>{c.affected} affected</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-1">
                      {c.expertise.slice(0, 2).map((e, j) => (
                        <span key={j} className="text-xs px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700">
                          {e}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg text-xs">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span>{c.match}%</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail panel */}
            {selectedChallenge !== null && (
              <div className="lg:col-span-3">
                <div className="rounded-2xl p-6 mb-6 bg-white border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between mb-4 border-b border-gray-100 pb-4">
                    <div>
                      <div className="text-xs text-[#0B63F6] font-bold tracking-widest mb-1 uppercase">MATCH #{selectedChallenge + 1}</div>
                      <h2 className="text-xl font-extrabold text-[#071A33]" style={{ fontFamily: "var(--font-display)" }}>{challenge.title}</h2>
                    </div>
                    <div className="text-right bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <div className="text-3xl font-extrabold text-emerald-600" style={{ fontFamily: "var(--font-display)" }}>{challenge.match}%</div>
                      <div className="text-xs font-semibold text-emerald-800">Match Score</div>
                    </div>
                  </div>

                  {/* Expertise bars */}
                  <div className="space-y-3 mb-6">
                    <div className="text-xs text-gray-500 font-bold tracking-wider uppercase mb-3">EXPERTISE COMPATIBILITY</div>
                    {challenge.radarData.map((r, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">{r.subject}</span>
                          <span className="text-[#071A33] font-mono font-bold">{r.value}%</span>
                        </div>
                        <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                          <div className="h-full rounded-full bg-[#0B63F6]" style={{ width: `${r.value}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => onNavigate("project-workspace")} className="flex-1 py-3 rounded-xl font-bold text-white text-sm transition-all hover:bg-blue-600 bg-[#0B63F6] shadow-sm cursor-pointer">
                      Accept Project & Assign Team
                    </button>
                    <button onClick={() => onNavigate("project-workspace")} className="px-5 py-3 rounded-xl font-semibold text-gray-700 hover:bg-gray-100 text-sm transition-all border border-gray-300 bg-white cursor-pointer">
                      View Full Workspace
                    </button>
                  </div>
                </div>

                {/* Radar chart */}
                <div className="rounded-2xl p-6 bg-white border border-gray-200 shadow-sm">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">EXPERTISE RADAR</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={challenge.radarData}>
                      <PolarGrid stroke="#E2E8F0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 11 }} />
                      <Radar name="Match" dataKey="value" stroke="#0B63F6" fill="#0B63F6" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "active" && (
          <div className="space-y-4">
            {activeProjects.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 cursor-pointer hover:shadow-md transition-all bg-white border border-gray-200"
                onClick={() => onNavigate("project-workspace")}
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-[#071A33]" style={{ fontFamily: "var(--font-display)" }}>{p.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><Clock size={14} className="text-gray-400" /> {p.stage}</span>
                      <span className="flex items-center gap-1.5"><Users size={14} className="text-gray-400" /> {p.team} team members</span>
                      <span className="flex items-center gap-1.5"><TrendingUp size={14} className="text-gray-400" /> {p.impact}</span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />
                </div>
                <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
                  <span>Progress</span>
                  <span className="font-bold" style={{ color: p.progress >= 90 ? "#10B981" : "#0B63F6" }}>{p.progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden bg-gray-100">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.progress}%`, background: p.progress >= 90 ? "#10B981" : "#0B63F6" }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "faculty" && (
          <div className="space-y-6">
            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={20} className="text-[#0B63F6]" />
                <h2 className="font-bold text-lg text-[#071A33]">Faculty Mentors & Student Research Teams</h2>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                Manage interdisciplinary university teams, pair faculty mentors with student leads, and monitor build & deployment progress across all active projects.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {facultyTeams.map((team, idx) => (
                <div key={idx} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                      {team.dept}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {team.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#071A33] mb-2">{team.project}</h3>
                  <div className="space-y-2 text-xs text-gray-600 mb-6">
                    <div><span className="font-semibold text-gray-800">Faculty Mentor:</span> {team.mentor}</div>
                    <div><span className="font-semibold text-gray-800">Lead Student:</span> {team.leadStudent}</div>
                    <div><span className="font-semibold text-gray-800">Team Size:</span> {team.members} members</div>
                  </div>

                  <button
                    onClick={() => onNavigate("project-workspace")}
                    className="w-full py-2.5 rounded-xl font-bold text-sm text-[#0B63F6] bg-blue-50 hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer border border-blue-200"
                  >
                    <span>Open Project Workspace</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

