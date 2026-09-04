import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Brain,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Share2,
  Building2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function CitizenChallengeDetails() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (challengeId) {
        const found = await challengeService.getChallengeById(challengeId);
        setChallenge(found);
      }
      setLoading(false);
    }
    load();
  }, [challengeId]);

  if (loading) return <LoadingState message="Fetching challenge dossier..." />;

  if (!challenge) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle size={40} className="text-gray-400 mb-3" />
        <h2 className="text-xl font-bold text-[#071A33]">Challenge Not Found</h2>
        <p className="text-xs text-gray-500 mb-4">The challenge ID '{challengeId}' was not found.</p>
        <Link to="/citizen/challenges" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600">
          Back to My Challenges
        </Link>
      </div>
    );
  }

  const priorityFactors = [
    { label: "Community Severity", score: 18, max: 20 },
    { label: "Population Affected", score: 19, max: 20 },
    { label: "Urgency Multiplier", score: 17, max: 20 },
    { label: "Semantic Duplication Cluster", score: 18, max: 20 },
    { label: "Vulnerability Index", score: 10, max: 10 },
    { label: "Academic Feasibility", score: 7, max: 10 },
  ];

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        backTo="/citizen/challenges"
        backLabel="Back to Challenges"
        badge={`Challenge Dossier · ${challenge.id}`}
        title={challenge.title}
        subtitle={`Reported in ${challenge.location} · Logged by ${challenge.submittedBy}`}
      >
        <div className="flex items-center gap-2">
          <StatusBadge status={challenge.status} />
          <PriorityBadge priority={challenge.priority} />
        </div>
      </DashboardHeader>

      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Dossier Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                Problem Description
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                {challenge.description}
              </p>

              {/* Badges and tags */}
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
                {challenge.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-slate-100 text-gray-700"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Diagnostics & Priority Breakdown */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#071A33]">CivicAI Priority Breakdown</h3>
                    <p className="text-xs text-gray-500">Automated multi-factor evaluation</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-extrabold text-red-500">{challenge.priorityScore}</div>
                  <div className="text-[10px] text-gray-400">Total Score / 100</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                {priorityFactors.map((factor, i) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span className="text-gray-700">{factor.label}</span>
                      <span className="text-blue-600">
                        {factor.score}/{factor.max}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600"
                        style={{ width: `${(factor.score / factor.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resolution Progress Bar & Stage */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-bold text-[#071A33]">Current Solution Stage</h3>
                <span className="text-sm font-extrabold text-blue-600">{challenge.progress}% Complete</span>
              </div>
              <p className="text-xs text-gray-500 mb-4">{challenge.stage}</p>

              <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-6">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500"
                  style={{ width: `${challenge.progress}%` }}
                />
              </div>

              {/* Activity Timeline list */}
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
                Milestone Verification History
              </h4>
              <div className="space-y-4">
                {challenge.timeline?.map((item, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-gray-800">{item.event}</p>
                      <span className="text-[11px] text-gray-400">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Matched University & Citizen Impact */}
          <div className="space-y-6">
            {/* University Match Card */}
            <div className="bg-purple-50/60 border border-purple-200 rounded-3xl p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-purple-950">Matched Research Institution</h3>
                  <span className="text-xs text-purple-700">AI Compatibility: 94%</span>
                </div>
              </div>

              {challenge.assignedUniversity ? (
                <div>
                  <p className="text-sm font-extrabold text-[#071A33] mb-1">
                    {challenge.assignedUniversity}
                  </p>
                  <p className="text-xs text-gray-600 leading-relaxed mb-4">
                    Student and faculty researchers have adopted this challenge and built an active engineering workspace.
                  </p>

                  <Link
                    to="/university/projects/PRJ-2026-001"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                  >
                    View Project Workspace <ArrowRight size={14} />
                  </Link>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-gray-600 leading-relaxed mb-3">
                    Currently circulating across accredited colleges and state engineering departments for team adoption.
                  </p>
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                    In Matching Queue
                  </span>
                </div>
              )}
            </div>

            {/* Impact Metric Box */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Demographic Impact Estimate
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs text-gray-500">Affected Population</span>
                  <span className="text-xs font-bold text-gray-900">{challenge.affectedPeople}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-xs text-gray-500">Merged Community Reports</span>
                  <span className="text-xs font-bold text-blue-600">{challenge.similarReports} reports</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Regional District</span>
                  <span className="text-xs font-bold text-gray-900">{challenge.district}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
