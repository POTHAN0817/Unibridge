import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  MapPin,
  Users,
  TrendingUp,
  Clock,
  ChevronRight,
  Star,
  Zap,
  ArrowLeft,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { useAuth } from "../../auth/AuthContext";
import { challengeService } from "../../services/challengeService";
import { projectService } from "../../services/projectService";
import { Challenge, Project } from "../../types";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";

const mockRadarData = [
  { subject: "Agriculture", value: 98 },
  { subject: "IoT Sensors", value: 91 },
  { subject: "Cold Chain", value: 87 },
  { subject: "Lab Capacity", value: 78 },
  { subject: "Proximity", value: 82 },
];

export default function UniversityDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(0);
  const [tab, setTab] = useState<"recommended" | "active" | "teams">("recommended");

  useEffect(() => {
    async function loadData() {
      const ch = await challengeService.getAllChallenges();
      const pr = await projectService.getAllProjects();
      setChallenges(ch);
      setProjects(pr);
    }
    loadData();
  }, []);

  const selectedChallenge = challenges[selectedChallengeIndex] || challenges[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <DashboardHeader
        badge={user?.organization || "KALASALINGAM ACADEMY OF RESEARCH AND EDUCATION"}
        badgeColor="#8B5CF6"
        title="University Innovation & Faculty Command Center"
        subtitle="AI-matched societal challenges, student-faculty multidisciplinary teams, and real-world pilot projects."
      >
        <Link
          to="/university/projects"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs"
        >
          <Layers size={15} /> All Active Projects
        </Link>
      </DashboardHeader>

      <PageContainer>
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Recommended Challenges"
            value="12"
            icon={Brain}
            color="#8B5CF6"
            subtext="AI High-compatibility matches"
          />
          <StatCard
            label="Active Projects"
            value={projects.length.toString().padStart(2, "0")}
            icon={Zap}
            color="#10B981"
            subtext="Multi-dept student teams"
          />
          <StatCard
            label="Faculty & Students"
            value="46"
            icon={Users}
            color="#0B63F6"
            subtext="Engaged in active pilots"
          />
          <StatCard
            label="Campus Impact Score"
            value="89/100"
            icon={TrendingUp}
            color="#F59E0B"
            subtext="Top 5% in Tamil Nadu"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: "recommended", label: "AI-Recommended Challenges (12)" },
            { id: "active", label: `Active Campus Projects (${projects.length})` },
            { id: "teams", label: "Faculty & Student Research Teams" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as any)}
              className={`py-3 px-5 text-xs font-bold whitespace-nowrap transition-all border-b-2 cursor-pointer ${
                tab === t.id
                  ? "border-purple-600 text-purple-600 bg-purple-50/50"
                  : "border-transparent text-gray-500 hover:text-gray-900"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab 1: AI Recommended Challenges */}
        {tab === "recommended" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left list (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              {challenges.map((c, idx) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedChallengeIndex(idx)}
                  className={`rounded-2xl p-5 border transition-all cursor-pointer ${
                    selectedChallengeIndex === idx
                      ? "bg-purple-50/40 border-purple-400 shadow-md ring-1 ring-purple-400"
                      : "bg-white border-gray-200 hover:border-purple-200 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {c.category}
                        </span>
                        <PriorityBadge priority={c.priority} />
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          94% Match
                        </span>
                      </div>
                      <h3 className="font-bold text-base text-[#071A33]">{c.title}</h3>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="text-xl font-extrabold text-purple-600">
                        {c.priorityScore}
                      </div>
                      <span className="text-[10px] text-gray-400">Score</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">{c.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {c.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {c.affectedPeople}
                    </span>
                    <span className="text-purple-600 font-semibold">
                      Requires: {c.requiredExpertise?.join(", ") || "Engineering"}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right radar & adoption details */}
            {selectedChallenge && (
              <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6 shadow-xs h-fit space-y-6">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-purple-600 mb-1">
                    AI Institutional Fit Analysis
                  </div>
                  <h3 className="text-base font-extrabold text-[#071A33]">
                    {selectedChallenge.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Matched against your institution's patent portfolio, lab equipment, and faculty publications.
                  </p>
                </div>

                {/* Radar Chart */}
                <div className="h-52 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={mockRadarData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 10 }} />
                      <Radar
                        name="Compatibility"
                        dataKey="value"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.35}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2 pt-2 border-t border-gray-200">
                  <div className="text-xs font-bold text-gray-700">Recommended Faculty Mentors:</div>
                  <p className="text-xs text-purple-700 font-medium">
                    Dr. Anjali Kumar (Agricultural Engg) & Prof. Rajan Suresh (IoT)
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    to={`/university/challenges/${selectedChallenge.id}`}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                  >
                    View Challenge Details & Adopt <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Active Projects */}
        {tab === "active" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => navigate(`/university/projects/${proj.id}`)}
                className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                      {proj.category}
                    </span>
                    <h3 className="font-bold text-base text-[#071A33] mt-1.5 group-hover:text-purple-600 transition-colors">
                      {proj.title}
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                    {proj.progress}%
                  </span>
                </div>

                <p className="text-xs text-gray-500 mb-4">{proj.description}</p>

                {/* Progress bar */}
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-4">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <span>Lead: {proj.leadStudent}</span>
                  <span className="font-semibold text-purple-600 flex items-center gap-1">
                    Open Workspace <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Faculty & Teams */}
        {tab === "teams" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                mentor: "Dr. Anjali Kumar",
                dept: "Agricultural Engineering",
                leadStudent: "Aarav Krishnan",
                members: 8,
                project: "Smart Cold Chain for Rural Farmers",
                status: "Active Pilot",
              },
              {
                mentor: "Prof. Rajan Suresh",
                dept: "IoT & Embedded Systems",
                leadStudent: "Priya Venkat",
                members: 6,
                project: "AI Water Quality Monitoring",
                status: "Prototyping",
              },
              {
                mentor: "Dr. Meera Nair",
                dept: "Computer Science & AI",
                leadStudent: "Rahul Mohan",
                members: 5,
                project: "Remote Healthcare Platform",
                status: "Research",
              },
            ].map((team, idx) => (
              <div
                key={idx}
                className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                      {team.mentor.split(" ")[1]?.[0] || "F"}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#071A33]">{team.mentor}</h4>
                      <p className="text-[11px] text-gray-400">{team.dept}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>Student Lead:</span>
                      <strong className="text-gray-900">{team.leadStudent}</strong>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Team Size:</span>
                      <strong className="text-gray-900">{team.members} Researchers</strong>
                    </div>
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-[11px] text-gray-400 block">Assigned Solution:</span>
                      <p className="font-semibold text-purple-700 mt-0.5">{team.project}</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/university/teams"
                  className="w-full text-center py-2 px-3 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                >
                  Manage Team Roster
                </Link>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
