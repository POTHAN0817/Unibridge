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
  Image as ImageIcon,
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

            {/* Supporting Evidence Image Card */}
            {challenge.image?.url && (
              <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <ImageIcon size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#071A33]">Supporting Photo Evidence</h3>
                    <p className="text-xs text-gray-500">Field photo uploaded during challenge report</p>
                  </div>
                </div>
                <div className="rounded-2xl overflow-hidden border border-gray-200 bg-slate-50 max-h-[480px]">
                  <img
                    src={challenge.image.url}
                    alt={challenge.title}
                    className="w-full h-full object-contain max-h-[480px] mx-auto"
                  />
                </div>
              </div>
            )}

            {/* AI Diagnostics & Priority Breakdown */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#071A33]">CivicAI Priority Breakdown</h3>
                    <p className="text-xs text-gray-500">
                      {challenge.priority_analysis?.level
                        ? `Level: ${challenge.priority_analysis.level.toUpperCase()} · Explainable 5-Factor Evaluation`
                        : "Automated multi-factor evaluation"}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className="text-3xl font-extrabold"
                    style={{
                      color:
                        challenge.priorityScore >= 70
                          ? "#EF4444"
                          : challenge.priorityScore >= 40
                            ? "#F59E0B"
                            : "#10B981",
                    }}
                  >
                    {challenge.priorityScore}
                  </div>
                  <div className="text-[10px] text-gray-400">Total Score / 100</div>
                </div>
              </div>

              {/* Real Priority Factors Breakdown */}
              {challenge.priority_analysis?.factors ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  {Object.entries(challenge.priority_analysis.factors).map(([key, f]) => {
                    const labelMap: Record<string, string> = {
                      severity: "Domain Severity (25%)",
                      urgency: "Urgency Multiplier (20%)",
                      population_impact: "Population Impact (20%)",
                      frequency_duplicates: "Duplication Cluster (15%)",
                      feasibility: "Academic Feasibility (20%)",
                    };
                    const title = labelMap[key] || key.replace(/_/g, " ").toUpperCase();
                    return (
                      <div key={key} className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
                        <div className="flex justify-between text-xs font-semibold mb-1.5">
                          <span className="text-gray-700">{title}</span>
                          <span className="text-blue-600">
                            {Math.round(f.weighted_contribution)} pts
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-600"
                            style={{ width: `${Math.min(100, Math.max(0, f.normalized_score))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                          <span>Raw: {String(f.raw_value ?? "N/A")}</span>
                          <span>Norm: {Math.round(f.normalized_score)}/100</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : null}

              {/* Real Factual Priority Explanation */}
              {challenge.priority_analysis?.explanation && (
                <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-gray-100 text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-800">Scoring Rationale: </span>
                  {challenge.priority_analysis.explanation}
                </div>
              )}
            </div>

            {/* Semantic Duplication Cluster Section */}
            {challenge.duplicate_analysis?.duplicate_candidates &&
              challenge.duplicate_analysis.duplicate_candidates.length > 0 && (
                <div className="bg-white border border-amber-200 rounded-3xl p-6 sm:p-8 shadow-xs">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-amber-950">
                        Semantically Similar Reports ({challenge.duplicate_analysis.duplicate_count})
                      </h3>
                      <p className="text-xs text-amber-800/80">
                        Highest similarity: {Math.round(challenge.duplicate_analysis.highest_similarity * 100)}%
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    {challenge.duplicate_analysis.duplicate_candidates.map((cand, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-gray-900 truncate">{cand.title}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            {[cand.district, cand.state].filter(Boolean).join(", ") || "Location unlisted"}
                          </p>
                        </div>
                        <span className="px-2.5 py-1 rounded-lg bg-white border border-amber-200 font-bold text-amber-800 flex-shrink-0">
                          {Math.round(cand.similarity_score * 100)}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  <h3 className="text-sm font-bold text-purple-950">Matched Research Institutions</h3>
                  <span className="text-xs text-purple-700">
                    {challenge.university_matches?.matches && challenge.university_matches.matches.length > 0
                      ? `${challenge.university_matches.matches.length} Institution Match(es)`
                      : "Matching Pipeline Active"}
                  </span>
                </div>
              </div>

              {challenge.university_matches?.matches && challenge.university_matches.matches.length > 0 ? (
                <div className="space-y-4">
                  {challenge.university_matches.matches.map((match, mIdx) => (
                    <div
                      key={mIdx}
                      className="p-4 rounded-2xl bg-white border border-purple-200/80 shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-[#071A33]">{match.university_name}</h4>
                          <p className="text-[11px] text-gray-500">
                            {[match.location?.city, match.location?.state].filter(Boolean).join(", ") || "India"}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-purple-100 text-purple-800">
                            {match.score}/100
                          </span>
                          <div className="text-[10px] text-purple-600 font-semibold mt-0.5">{match.level}</div>
                        </div>
                      </div>

                      {match.matched_skills && match.matched_skills.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Matched Expertise:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.matched_skills.map((sk, sIdx) => (
                              <span
                                key={sIdx}
                                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {match.explanation && (
                        <p className="text-[11px] text-gray-600 leading-relaxed pt-2 border-t border-gray-100 italic">
                          "{match.explanation}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-2">
                  <p className="text-xs font-semibold text-gray-800 mb-1">
                    No matching universities available yet.
                  </p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    Universities will appear here once relevant departmental expertise, testing laboratories, and project capability profiles are available in MongoDB.
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
                  <span className="text-xs font-bold text-gray-900">{challenge.district || "Not specified"}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </PageContainer>
    </div>
  );
}
