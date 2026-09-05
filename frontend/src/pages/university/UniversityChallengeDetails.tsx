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
  Award,
  Sparkles,
  BarChart2,
} from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { universityService } from "../../services/universityService";
import { Challenge, UniversityMatchesResult, UniversityProfile, UniversityMatchCandidate } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function UniversityChallengeDetails() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [matchesResult, setMatchesResult] = useState<UniversityMatchesResult | null>(null);
  const [myProfile, setMyProfile] = useState<UniversityProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (challengeId) {
        const [c, matches, profile] = await Promise.all([
          challengeService.getChallengeById(challengeId),
          universityService.getChallengeUniversityMatches(challengeId),
          universityService.getMyProfile(),
        ]);
        setChallenge(c);
        setMatchesResult(matches);
        setMyProfile(profile);
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

  // Find if current university is matched
  const currentMatch: UniversityMatchCandidate | undefined =
    matchesResult?.matches?.find(
      (m) => (myProfile?.id && m.university_id === myProfile.id) || (myProfile?.name && m.university_name === myProfile.name)
    ) || matchesResult?.matches?.[0];

  const matchSubtitle = currentMatch
    ? `${challenge.location} · ${currentMatch.score}% Departmental Match (${currentMatch.level})`
    : `${challenge.location} · Academic Evaluation`;

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        backTo="/university/challenges"
        backLabel="Back to Recommended Challenges"
        badge={`Academic Evaluation · ${challenge.id}`}
        badgeColor="#8B5CF6"
        title={challenge.title}
        subtitle={matchSubtitle}
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
                  <h4 className="text-xs font-bold text-purple-900">CivicAI Problem Summary</h4>
                  <p className="text-xs text-purple-800/80 mt-1">
                    {challenge.aiSummary || "Recommended for university R&D initiative or student capstone project."}
                  </p>
                </div>
              </div>
            </div>

            {/* University Match Rationale & Breakdown */}
            {currentMatch && (
              <div className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-purple-600" />
                    <h3 className="text-base font-bold text-[#071A33]">
                      Institutional Match Analysis
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                    {currentMatch.score}% ({currentMatch.level})
                  </span>
                </div>

                <p className="text-xs text-gray-600 mb-6 bg-slate-50 p-4 rounded-2xl border border-gray-100 leading-relaxed">
                  {currentMatch.explanation}
                </p>

                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Score Factor Breakdown
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 block">Faculty Expertise (40%)</span>
                    <span className="text-sm font-bold text-[#071A33]">{Math.round(currentMatch.factors.expertise_similarity)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 block">Student Skills (20%)</span>
                    <span className="text-sm font-bold text-[#071A33]">{Math.round(currentMatch.factors.skill_match)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 block">Past Projects (15%)</span>
                    <span className="text-sm font-bold text-[#071A33]">{Math.round(currentMatch.factors.previous_project_match)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 block">Infrastructure (10%)</span>
                    <span className="text-sm font-bold text-[#071A33]">{Math.round(currentMatch.factors.infrastructure_match)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 block">Location Proximity (10%)</span>
                    <span className="text-sm font-bold text-[#071A33]">{Math.round(currentMatch.factors.location_relevance)}%</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-gray-100">
                    <span className="text-[11px] text-gray-400 block">Availability (5%)</span>
                    <span className="text-sm font-bold text-[#071A33]">{Math.round(currentMatch.factors.availability)}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <h3 className="text-base font-bold text-[#071A33] mb-4">
                Required Technical Competencies
              </h3>
              {challenge.requiredExpertise && challenge.requiredExpertise.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {challenge.requiredExpertise.map((exp, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-gray-100">
                      <CheckCircle2 size={16} className="text-purple-600 flex-shrink-0" />
                      <span className="text-xs font-semibold text-gray-800">{exp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">Technical competencies pending problem analysis.</p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-purple-600 text-white rounded-3xl p-6 shadow-md">
              <h3 className="text-base font-bold mb-2">Engage with Challenge</h3>
              <p className="text-xs text-purple-100 leading-relaxed mb-6">
                Review this verified civic challenge and connect your university research departments or student capstone groups.
              </p>

              <Link
                to="/university/projects"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-purple-950 bg-white hover:bg-purple-50 transition-colors shadow-xs"
              >
                <FolderPlus size={16} /> View University Projects
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
                  <span className="text-gray-500">Priority Score:</span>
                  <span className="font-semibold text-purple-600">{challenge.priorityScore || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
