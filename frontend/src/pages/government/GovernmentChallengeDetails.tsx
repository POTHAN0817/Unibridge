import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Brain,
  MapPin,
  Users,
  AlertTriangle,
  Building2,
} from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentChallengeDetails() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [validatedMessage, setValidatedMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (challengeId) {
        const c = await challengeService.getChallengeById(challengeId);
        setChallenge(c);
      }
      setLoading(false);
    }
    load();
  }, [challengeId]);

  const handleValidate = async (decision: "APPROVE" | "REJECT") => {
    if (!challenge) return;
    const updated = await challengeService.validateChallenge(challenge.id, decision);
    if (updated) {
      setChallenge(updated);
      setValidatedMessage(decision === "APPROVE" ? "Challenge approved and dispatched to university matching queue!" : "Challenge marked for further district review.");
    }
  };

  if (loading) return <LoadingState message="Loading challenge for government review..." />;

  if (!challenge) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <p className="text-gray-500 mb-4">Challenge not found.</p>
        <Link to="/government/challenges" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600">
          Back to Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        backTo="/government/challenges"
        backLabel="Back to Registry"
        badge={`Official Validation Dossier · ${challenge.id}`}
        badgeColor="#10B981"
        title={challenge.title}
        subtitle={`${challenge.location} · Logged by ${challenge.submittedBy}`}
      >
        <div className="flex items-center gap-2">
          <PriorityBadge priority={challenge.priority} />
          <StatusBadge status={challenge.status} />
        </div>
      </DashboardHeader>

      <PageContainer>
        {validatedMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} /> {validatedMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Citizen Submission Summary
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                {challenge.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[11px] font-bold uppercase">District</span>
                  <strong className="text-gray-900">{challenge.district}, {challenge.state}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] font-bold uppercase">Affected</span>
                  <strong className="text-emerald-600">{challenge.affectedPeople}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[11px] font-bold uppercase">Reported Date</span>
                  <strong className="text-gray-900">{challenge.submittedDate}</strong>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <Brain size={18} className="text-emerald-600" />
                <h3 className="text-base font-bold text-[#071A33]">CivicAI NLP Analysis & Urgency Scoring</h3>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                {challenge.aiSummary || "Calculated priority based on direct crop loss economic indicators, local cluster of complaints, and district agricultural vulnerability."}
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700">Calculated Priority Score</span>
                <span className="text-2xl font-extrabold text-red-500">{challenge.priorityScore}/100</span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-emerald-600 text-white rounded-3xl p-6 shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={20} />
                <h3 className="text-base font-bold">Government Triage Order</h3>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed mb-6">
                Officially validate this citizen challenge to release state innovation funding and assign accredited universities.
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => handleValidate("APPROVE")}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-emerald-950 bg-white hover:bg-emerald-50 transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle2 size={16} /> Approve & Dispatch to Universities
                </button>
                <button
                  onClick={() => handleValidate("REJECT")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  <XCircle size={16} /> Request District Resubmission
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Assigned Stakeholders
              </h4>
              <div className="space-y-2 text-xs">
                <div>University: <strong className="text-purple-700">{challenge.assignedUniversity || "Pending matching"}</strong></div>
                <div>Status: <strong className="text-gray-900">{challenge.stage}</strong></div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
