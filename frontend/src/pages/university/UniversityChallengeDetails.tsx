import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Brain,
  MapPin,
  Users,
  CheckCircle2,
  ArrowRight,
  Building2,
  AlertTriangle,
  FolderPlus,
} from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function UniversityChallengeDetails() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <LoadingState message="Loading challenge details..." />;

  if (!challenge) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <p className="text-gray-500 mb-4">Challenge not found.</p>
        <Link to="/university/challenges" className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600">
          Back to Challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        backTo="/university/challenges"
        backLabel="Back to Recommended Challenges"
        badge={`Academic Evaluation · ${challenge.id}`}
        badgeColor="#8B5CF6"
        title={challenge.title}
        subtitle={`${challenge.location} · 94% Departmental Match Score`}
      >
        <div className="flex items-center gap-2">
          <PriorityBadge priority={challenge.priority} />
          <StatusBadge status={challenge.status} />
        </div>
      </DashboardHeader>

      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                Problem Statement & Field Background
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                {challenge.description}
              </p>

              <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start gap-3">
                <Brain size={20} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-purple-900">CivicAI Research Synthesis</h4>
                  <p className="text-xs text-purple-800/80 mt-1">
                    {challenge.aiSummary || "Recommended for student final year capstone or faculty-led innovation grant."}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-[#071A33] mb-4">
                Required Technical Competencies
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {challenge.requiredExpertise?.map((exp, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-gray-100">
                    <CheckCircle2 size={16} className="text-purple-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-gray-800">{exp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-purple-600 text-white rounded-3xl p-6 shadow-md">
              <h3 className="text-base font-bold mb-2">Form Solution Project Team</h3>
              <p className="text-xs text-purple-100 leading-relaxed mb-6">
                Adopt this community challenge, assign a lead faculty mentor, recruit student engineers, and unlock industry partner hardware support.
              </p>

              <Link
                to={`/university/projects/PRJ-2026-001`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-purple-950 bg-white hover:bg-purple-50 transition-colors shadow-xs"
              >
                <FolderPlus size={16} /> Adopt Challenge & Launch Project
              </Link>
            </div>

            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Field Logistics
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-semibold text-gray-800">{challenge.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Population:</span>
                  <span className="font-semibold text-gray-800">{challenge.affectedPeople}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Merged Reports:</span>
                  <span className="font-semibold text-blue-600">{challenge.similarReports}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
