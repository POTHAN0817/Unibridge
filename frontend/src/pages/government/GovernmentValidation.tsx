import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight, Brain, AlertTriangle } from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";

export default function GovernmentValidation() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await challengeService.getAllChallenges();
      setChallenges(data.filter((c) => c.status === "Submitted" || c.status === "AI Analyzed"));
      setLoading(false);
    }
    load();
  }, []);

  const handleQuickApprove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await challengeService.validateChallenge(id, "APPROVE");
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Nodal Review Queue"
        badgeColor="#10B981"
        title="Challenge Validation & Triage Queue"
        subtitle="Review citizen problem reports, verify severity thresholds, and sanction matching with university labs."
      />

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading validation queue..." />
        ) : challenges.length === 0 ? (
          <EmptyState
            title="Validation Queue Empty"
            description="All reported citizen challenges have been reviewed and validated."
            actionText="Browse National Pipeline"
            onAction={() => navigate("/government/projects")}
          />
        ) : (
          <div className="space-y-4">
            {challenges.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/government/challenges/${c.id}`)}
                className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-gray-700">
                      {c.category}
                    </span>
                    <PriorityBadge priority={c.priority} />
                    <span className="text-xs text-gray-400">ID: {c.id}</span>
                  </div>

                  <h3 className="text-lg font-bold text-[#071A33] group-hover:text-emerald-700 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-3">
                    <span>{c.location}</span>
                    <span>{c.affectedPeople} impacted</span>
                    <span>{c.similarReports} merged community submissions</span>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-red-500">{c.priorityScore}/100</span>
                    <span className="text-[10px] text-gray-400 block font-medium">CivicAI Priority</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleQuickApprove(c.id, e)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs cursor-pointer"
                    >
                      <CheckCircle2 size={14} /> Approve & Dispatch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
