import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Eye,
  MessageSquare,
  Users,
  Brain,
  PlusCircle,
  ArrowRight,
  Filter,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { StatCard } from "../../components/dashboard/StatCard";
import { ActivityTimeline } from "../../components/dashboard/ActivityTimeline";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";


export default function CitizenDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<"all" | "in-progress" | "resolved">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await challengeService.getMyChallenges();
        setChallenges(data);
      } catch (err) {
        console.error("Failed to load citizen challenges:", err);
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);


  const totalSubmitted = challenges.length;
  const inProgressCount = challenges.filter(
    (c) => c.status === "In Progress" || c.status === "Validated" || c.status === "Submitted"
  ).length;
  const resolvedCount = challenges.filter((c) => c.status === "Resolved").length;

  const filtered =
    filter === "all"
      ? challenges
      : filter === "resolved"
      ? challenges.filter((c) => c.status === "Resolved")
      : challenges.filter((c) => c.status !== "Resolved");

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <div className="px-6 py-8 bg-slate-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-1">
                CITIZEN COMMUNITY DASHBOARD
              </div>
              <h1
                className="text-3xl md:text-4xl font-extrabold text-[#071A33]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Welcome back, {user?.name || (user?.profile as Record<string, any>)?.full_name || "Citizen"} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {user?.district && user?.state
                  ? `${user.district}, ${user.state} · `
                  : user?.state
                  ? `${user.state} · `
                  : ""}Tracking local challenges & community outcomes
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/citizen/report"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-sm"
              >
                <PlusCircle size={18} /> Report New Challenge
              </Link>
            </div>
          </div>

          {/* Quick stats cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <StatCard
              label="Challenges Submitted"
              value={totalSubmitted.toString().padStart(2, "0")}
              icon={AlertCircle}
              color="#0B63F6"
              subtext="Logged in your district"
            />
            <StatCard
              label="In Progress Solutions"
              value={inProgressCount.toString().padStart(2, "0")}
              icon={Clock}
              color="#8B5CF6"
              subtext="Assigned to research labs"
            />
            <StatCard
              label="Resolved & Deployed"
              value={resolvedCount.toString().padStart(2, "0")}
              icon={CheckCircle2}
              color="#10B981"
              subtext="Live community impact"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Challenges List (2 Cols) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2
                  className="text-xl font-bold text-[#071A33]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Your Submitted Challenges
                </h2>
                <p className="text-xs text-gray-500">Track progress through validation, prototyping, and deployment</p>
              </div>

              {/* Filter pills */}
              <div className="flex gap-2">
                {[
                  ["all", "All"],
                  ["in-progress", "Active"],
                  ["resolved", "Resolved"],
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setFilter(val as typeof filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filter === val
                        ? "text-white bg-blue-600 shadow-xs"
                        : "text-gray-600 bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="py-16 flex flex-col items-center justify-center text-gray-500 rounded-2xl bg-slate-50/50 border border-gray-100">

                <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mb-3" />
                <p className="text-sm font-medium">Loading your submitted challenges...</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl p-10 bg-slate-50 border border-gray-200 text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                  <AlertCircle size={24} />
                </div>
                <h3 className="text-base font-bold text-[#071A33] mb-1">
                  No challenges reported yet.
                </h3>
                <p className="text-xs text-gray-500 mb-6 max-w-sm mx-auto">
                  Report societal challenges and infrastructure issues in your community to initiate real civic change.
                </p>
                <Link
                  to="/citizen/report"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs cursor-pointer"
                >
                  <PlusCircle size={16} /> Report a Challenge
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => navigate(`/citizen/challenges/${c.id}`)}
                    className="rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group bg-white border border-gray-200/90"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {c.category}
                          </span>
                          <PriorityBadge priority={c.priority} />
                          <StatusBadge status={c.status} />
                          {c.duplicate_analysis?.is_duplicate && (
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                              {c.duplicate_analysis.duplicate_count} Similar Reports
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base text-[#071A33] group-hover:text-blue-600 transition-colors">
                          {c.title}
                        </h3>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div
                          className="text-2xl font-extrabold"
                          style={{
                            color: c.priorityScore >= 80 ? "#EF4444" : "#0B63F6",
                            fontFamily: "var(--font-display)",
                          }}
                        >
                          {c.priorityScore > 0 ? c.priorityScore : "--"}
                        </div>
                        <div className="text-[11px] text-gray-400">AI Priority</div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mb-3">
                      {c.image?.url && (
                        <div className="w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-slate-100 border border-gray-200 flex-shrink-0">
                          <img
                            src={c.image.url}
                            alt={c.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                          {c.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-gray-400" />
                        {c.location || "Location not specified"}
                      </span>
                      {c.submittedDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={13} className="text-gray-400" />
                          Submitted {c.submittedDate}
                        </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span className="font-medium text-gray-700">{c.stage}</span>
                        <span className="font-semibold text-gray-700">{c.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${c.progress}%`,
                            background:
                              c.progress === 100
                                ? "#10B981"
                                : "linear-gradient(90deg, #0B63F6, #00C2FF)",
                          }}
                        />
                      </div>
                    </div>

                    {c.assignedUniversity ? (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-purple-700 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Brain size={13} />
                          <span>Assigned to {c.assignedUniversity}</span>
                        </div>
                        <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          View Details <ArrowRight size={13} />
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-500">
                        <span>Submitted & awaiting review...</span>
                        <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                          Track <ArrowRight size={13} />
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Activity & Community Info */}
          <div className="space-y-6">
            <ActivityTimeline
              items={
                challenges.length > 0
                  ? challenges.flatMap((ch) =>
                      (ch.timeline || []).map((tl, idx) => ({
                        id: `${ch.id}-${idx}`,
                        event: `${ch.title}: ${tl.event}`,
                        time: tl.time,
                        type: tl.type,
                      }))
                    ).slice(0, 8)
                  : []
              }
              title="Recent Challenge Updates"
            />


            {/* Support info card */}
            <div className="rounded-2xl p-6 bg-slate-50 border border-gray-200 text-center">
              <div className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center bg-blue-50 text-blue-600">
                <MessageSquare size={20} />
              </div>
              <h3
                className="font-bold text-sm text-[#071A33] mb-1"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Community Validation Network
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                When you report a problem, CivicAI clusters similar reports from neighboring villages to fast-track government priority.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
