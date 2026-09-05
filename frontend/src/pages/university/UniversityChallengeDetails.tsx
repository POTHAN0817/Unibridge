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
  Award,
  Sparkles,
  BarChart2,
  Calendar,
  Layers,
  Copy,
  ImageOff,
  AlertCircle,
  FileText,
  Clock,
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { universityService } from "../../services/universityService";
import { UniversityChallengeDossier, UniversityInterest } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function UniversityChallengeDetails() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();

  const [dossier, setDossier] = useState<UniversityChallengeDossier | null>(null);
  const [interest, setInterest] = useState<UniversityInterest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Interest Modal state
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadDossier = async () => {
    if (!challengeId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const data = await universityService.getUniversityChallengeDetails(challengeId);
      setDossier(data);
      if (data.interest) {
        setInterest(data.interest);
      }
    } catch (err: any) {
      console.error("Failed to load university challenge dossier:", err);
      if (err?.status === 404) {
        setNotFound(true);
      } else {
        setError(err?.message || "Failed to load challenge details. Please check the backend connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitInterest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await universityService.expressInterest(challengeId, message);
      setInterest(res);
      setShowModal(false);
      setMessage("");
    } catch (err: any) {
      console.error("Failed to express challenge interest:", err);
      setSubmitError(err?.message || "Failed to record interest. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadDossier();
  }, [challengeId]);

  // Loading State
  if (loading) {
    return <LoadingState message="Compiling institutional challenge dossier and compatibility evaluation..." />;
  }

  // Not Found State
  if (notFound || !dossier) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-16 h-16 rounded-3xl bg-slate-100 text-gray-400 flex items-center justify-center mb-4">
          <FileText size={32} />
        </div>
        <h2 className="text-xl font-bold text-[#071A33] mb-2">Challenge Dossier Not Found</h2>
        <p className="text-xs text-gray-500 max-w-md text-center mb-6 leading-relaxed">
          The requested civic challenge either does not exist, has been archived, or you do not have permission to view it.
        </p>
        <Link
          to="/university/challenges"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
        >
          <ArrowLeft size={14} /> Return to Matched Challenges
        </Link>
      </div>
    );
  }

  // API Error State
  if (error) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-red-900 mb-2">Unable to Retrieve Challenge</h2>
        <p className="text-xs text-red-700 max-w-md text-center mb-6 leading-relaxed">
          {error}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={loadDossier}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
          >
            Retry Request
          </button>
          <Link
            to="/university/challenges"
            className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Back to Challenges
          </Link>
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    category,
    subcategory,
    location,
    affected_people,
    urgency,
    status,
    submission_date,
    image,
    ai_status,
    ai_analysis,
    priority_analysis,
    duplicate_analysis,
    university_match,
    match_status,
  } = dossier;

  // Format submission date
  const formattedDate = submission_date
    ? new Date(submission_date).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Recently reported";

  const matchScore = university_match?.score ?? 0;
  const matchLevel = university_match?.level ?? "Not Evaluated";

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Navigation Header */}
      <DashboardHeader
        backTo="/university/challenges"
        backLabel="Back to Matched Challenges"
        badge={`Academic Field Dossier · ${dossier.challenge_id}`}
        badgeColor="#8B5CF6"
        title={title}
        subtitle={`${location} · ${category}${subcategory ? ` · ${subcategory}` : ""} · Reported ${formattedDate}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          <PriorityBadge priority={priority_analysis?.level || "medium"} />
          <StatusBadge status={status} />
          {urgency && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 uppercase tracking-wide">
              {urgency} Urgency
            </span>
          )}
          {interest ? (
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1.5">
              <Clock size={13} className="text-amber-600" /> Interest {interest.status.toUpperCase()}
            </span>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs cursor-pointer"
            >
              <Sparkles size={14} /> Express Interest
            </button>
          )}
        </div>
      </DashboardHeader>

      <PageContainer>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ============================================================ */}
          {/* LEFT 2 COLUMNS: Problem Details, Phase 2A, Phase 2B Analysis */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. Problem Overview & Evidence */}
            <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-purple-600" />
                  <h3 className="text-sm font-bold text-[#071A33] uppercase tracking-wider">
                    Problem Statement & Field Evidence
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {affected_people ? `${affected_people.toLocaleString()} citizens affected` : "Localized Impact"}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                {description}
              </p>

              {/* Field Photograph (Cloudinary or Real Empty State) */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                  Field Photography & Telemetry
                </h4>
                {image?.url ? (
                  <div className="rounded-2xl overflow-hidden border border-gray-200 bg-slate-100 max-h-96 flex items-center justify-center">
                    <img
                      src={image.url}
                      alt={title}
                      className="w-full h-full object-cover max-h-96"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-slate-50 p-8 text-center text-gray-400 space-y-2">
                    <ImageOff size={28} className="mx-auto text-gray-300" />
                    <p className="text-xs font-medium text-gray-500">
                      No photographic field evidence was uploaded with this citizen submission.
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Problem verified via citizen description and localized municipal parameters.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* 2. AI Problem Analysis */}
            <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Brain size={18} className="text-purple-600" />
                  <h3 className="text-sm font-bold text-[#071A33] uppercase tracking-wider">
                    AI Problem Analysis
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      ai_status === "completed"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : ai_status === "failed"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    AI Status: {ai_status.toUpperCase()}
                  </span>
                </div>
              </div>

              {ai_status === "completed" ? (
                <div className="space-y-5">
                  {/* AI Summary Banner */}
                  {ai_analysis?.summary && (
                    <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100">
                      <div className="text-[11px] font-bold text-purple-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <Sparkles size={13} /> CivicAI Structural Summary
                      </div>
                      <p className="text-xs text-purple-950/85 leading-relaxed">
                        {ai_analysis.summary}
                      </p>
                    </div>
                  )}

                  {/* Categorization & Confidence */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100">
                      <span className="text-[11px] font-semibold text-gray-400 block mb-1">
                        Domain Classification
                      </span>
                      <div className="text-sm font-bold text-gray-900">
                        {ai_analysis?.category || category}
                        {ai_analysis?.subcategory && (
                          <span className="text-xs font-medium text-gray-500 block mt-0.5">
                            Subcategory: {ai_analysis.subcategory}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-gray-100">
                      <span className="text-[11px] font-semibold text-gray-400 block mb-1">
                        AI Classification Confidence
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-[#071A33]">
                          {ai_analysis?.confidence != null
                            ? `${Math.round(ai_analysis.confidence * (ai_analysis.confidence <= 1 ? 100 : 1))}%`
                            : "Standard Evaluation"}
                        </span>
                        {ai_analysis?.confidence != null && (
                          <div className="flex-1 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ai_analysis.confidence <= 1
                                    ? ai_analysis.confidence * 100
                                    : ai_analysis.confidence
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Keywords */}
                  {ai_analysis?.keywords && ai_analysis.keywords.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                        Extracted Problem Keywords
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ai_analysis.keywords.map((kw, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-slate-100 text-gray-700 px-2.5 py-1 rounded-lg font-medium border border-gray-200/60"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Technical Skills */}
                  {ai_analysis?.required_skills && ai_analysis.required_skills.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                        Identified Technical Capabilities Needed
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ai_analysis.required_skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-purple-50 text-purple-800 border border-purple-100 px-2.5 py-1 rounded-lg font-semibold"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : ai_status === "failed" ? (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800">
                  <p className="font-bold">AI Analysis Unavailable</p>
                  <p className="mt-1 text-red-700">
                    {ai_analysis?.error || "AI problem classification could not be completed for this challenge."}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                  <p className="font-bold">AI Analysis In Progress</p>
                  <p className="mt-1 text-amber-700">
                    Automated problem classification and competency extraction is currently processing.
                  </p>
                </div>
              )}
            </section>

            {/* 3. Priority & Impact Assessment */}
            <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BarChart2 size={18} className="text-purple-600" />
                  <h3 className="text-sm font-bold text-[#071A33] uppercase tracking-wider">
                    Priority & Impact Evaluation
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-xl">
                    Score: {priority_analysis?.score ?? 0}/100
                  </span>
                  <PriorityBadge priority={priority_analysis?.level || "medium"} />
                </div>
              </div>

              {/* Priority Explanation */}
              {priority_analysis?.explanation && (
                <p className="text-xs text-gray-600 bg-slate-50 p-4 rounded-2xl border border-gray-100 leading-relaxed mb-6">
                  {priority_analysis.explanation}
                </p>
              )}

              {/* 5 Priority Dimension Factors */}
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Calculated Priority Factors
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  {
                    label: "Severity",
                    val: priority_analysis?.factors?.severity ?? 0,
                    sub: "Direct Impact",
                  },
                  {
                    label: "Urgency",
                    val: priority_analysis?.factors?.urgency ?? 0,
                    sub: "Time Sensitivity",
                  },
                  {
                    label: "Population",
                    val: priority_analysis?.factors?.population_impact ?? 0,
                    sub: "Citizens Affected",
                  },
                  {
                    label: "Frequency",
                    val: priority_analysis?.factors?.frequency ?? 0,
                    sub: "Recurrence",
                  },
                  {
                    label: "Feasibility",
                    val: priority_analysis?.factors?.feasibility ?? 0,
                    sub: "Academic R&D",
                  },
                ].map((factor, fIdx) => (
                  <div
                    key={fIdx}
                    className="p-3 bg-slate-50 rounded-2xl border border-gray-100 text-center"
                  >
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      {factor.label}
                    </span>
                    <span className="text-base font-extrabold text-[#071A33] block">
                      {factor.val}
                    </span>
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      {factor.sub}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Community Similarity & Duplicate Detection */}
            <section className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Copy size={18} className="text-purple-600" />
                  <h3 className="text-sm font-bold text-[#071A33] uppercase tracking-wider">
                    Community Similarity & Duplicate Detection
                  </h3>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    duplicate_analysis?.is_duplicate
                      ? "bg-amber-100 text-amber-800"
                      : "bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {duplicate_analysis?.is_duplicate ? "Duplicate Flagged" : "Unique Problem"}
                </span>
              </div>

              {duplicate_analysis?.candidates && duplicate_analysis.candidates.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">
                    The AI duplicate detection engine identified{" "}
                    <strong>{duplicate_analysis.candidates.length}</strong> related civic report
                    {duplicate_analysis.candidates.length > 1 ? "s" : ""} in the municipal repository:
                  </p>
                  <div className="space-y-2">
                    {duplicate_analysis.candidates.map((cand, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-gray-100"
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-xs font-bold text-gray-800 truncate">
                            {cand.title}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            ID: {cand.challenge_id}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                            {Math.round((cand.similarity || 0) * 100)}% Similarity
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 text-center text-xs text-gray-500">
                  <ShieldCheck size={20} className="text-emerald-500 mx-auto mb-1.5" />
                  No duplicate community submissions or overlapping reports were detected in this jurisdiction.
                </div>
              )}
            </section>
          </div>

          {/* ============================================================ */}
          {/* RIGHT 1 COLUMN: Institutional Match Dossier & Alignment */}
          {/* ============================================================ */}
          <div className="space-y-6">
            {/* Challenge Adoption & Express Interest Card */}
            <section className="bg-gradient-to-br from-[#1b0838] via-purple-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={18} className="text-purple-300" />
                <h3 className="text-sm font-bold tracking-wide">
                  Challenge Adoption
                </h3>
              </div>
              <p className="text-xs text-purple-200 leading-relaxed mb-5">
                Adopt this societal problem for faculty research, laboratory prototyping, or multidisciplinary student cohorts.
              </p>

              {interest ? (
                <div className="bg-white/10 rounded-2xl p-4 border border-white/15 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-200">Adoption Status:</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wide flex items-center gap-1">
                      <Clock size={12} /> {interest.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-300">
                    Expressed on {new Date(interest.created_at).toLocaleDateString()}
                  </p>
                  {interest.message && (
                    <p className="text-xs text-white/90 italic bg-white/5 p-2.5 rounded-xl border border-white/10">
                      "{interest.message}"
                    </p>
                  )}
                  <div className="pt-1 text-[11px] text-purple-200 flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-400" /> Interest is recorded in UniBridge database
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-purple-950 bg-white hover:bg-purple-50 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} className="text-purple-600" /> Express Institutional Interest
                </button>
              )}
            </section>

            {/* 5. Your University Match Evaluation */}
            <section className="bg-white border border-purple-200 rounded-3xl p-6 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-purple-600" />
                  <h3 className="text-sm font-bold text-[#071A33]">
                    Your Institutional Match
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  Dynamic Evaluation
                </span>
              </div>

              {match_status === "profile_incomplete" || match_status === "profile_not_found" ? (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center space-y-3">
                  <Building2 size={24} className="text-amber-600 mx-auto" />
                  <h4 className="text-xs font-bold text-amber-900">
                    Profile Capabilities Needed
                  </h4>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Complete your university profile to calculate explainable compatibility scores and departmental matching.
                  </p>
                  <Link
                    to="/university/profile"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                  >
                    Configure Capabilities <ArrowRight size={13} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Score & Level Banner */}
                  <div className="text-center py-2 bg-purple-50/60 rounded-2xl border border-purple-100">
                    <div className="text-4xl font-extrabold text-purple-600">
                      {matchScore}/100
                    </div>
                    <div className="text-xs font-bold text-purple-900 mt-1">
                      {matchLevel}
                    </div>
                    <p className="text-[10px] text-purple-700 mt-0.5">
                      Evaluated for {university_match?.university_name || "Your Institution"}
                    </p>
                  </div>

                  {/* 6 Dimension Factor Breakdown */}
                  {university_match?.factors && (
                    <div className="space-y-2.5 text-xs">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                        6-Factor Compatibility Breakdown
                      </h4>

                      {[
                        {
                          label: "Faculty Expertise",
                          weight: "40%",
                          score: university_match.factors.expertise_similarity,
                        },
                        {
                          label: "Student Skills",
                          weight: "20%",
                          score: university_match.factors.skill_match,
                        },
                        {
                          label: "Past R&D Projects",
                          weight: "15%",
                          score: university_match.factors.previous_project_match,
                        },
                        {
                          label: "Lab Infrastructure",
                          weight: "10%",
                          score: university_match.factors.infrastructure_match,
                        },
                        {
                          label: "Location Proximity",
                          weight: "10%",
                          score: university_match.factors.location_relevance,
                        },
                        {
                          label: "Campus Availability",
                          weight: "5%",
                          score: university_match.factors.availability,
                        },
                      ].map((item, idx) => (
                        <div key={idx} className="space-y-1">
                          <div className="flex justify-between text-gray-600">
                            <span>
                              {item.label} <strong className="text-gray-400 font-normal">({item.weight})</strong>
                            </span>
                            <span className="font-bold text-gray-900">{item.score}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-600 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Match Explanation */}
                  {university_match?.explanation && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-gray-100">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                        Matching Engine Rationale
                      </span>
                      <p className="text-xs text-gray-700 italic leading-relaxed">
                        "{university_match.explanation}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 6. Matched Academic Departments & Faculty */}
            <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <GraduationCap size={18} className="text-purple-600" />
                <h3 className="text-sm font-bold text-[#071A33]">
                  Departmental & Faculty Alignment
                </h3>
              </div>

              {/* Matched Departments */}
              <div>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Matching University Departments
                </span>
                {university_match?.matched_departments && university_match.matched_departments.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {university_match.matched_departments.map((dept, dIdx) => (
                      <span
                        key={dIdx}
                        className="text-xs bg-purple-50 text-purple-800 border border-purple-100 px-2.5 py-1 rounded-lg font-semibold"
                      >
                        {dept}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    General institutional match across research areas.
                  </p>
                )}
              </div>

              {/* Matched Faculty */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
                  Relevant Faculty Mentors
                </span>
                {university_match?.matched_faculty && university_match.matched_faculty.length > 0 ? (
                  <div className="space-y-1.5">
                    {university_match.matched_faculty.map((fac, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 text-xs text-gray-800 font-medium"
                      >
                        <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-[10px]">
                          {fac.trim().charAt(0)}
                        </div>
                        <span>{fac}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No specific faculty mentor assigned yet.
                  </p>
                )}
              </div>
            </section>

            {/* 7. Matched Skills vs Missing Skills */}
            <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Layers size={18} className="text-purple-600" />
                <h3 className="text-sm font-bold text-[#071A33]">
                  Technical Skill Competency
                </h3>
              </div>

              {/* Matched Skills */}
              <div>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-2 flex items-center gap-1">
                  <Check size={12} /> Matched Institutional Skills
                </span>
                {university_match?.matched_skills && university_match.matched_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {university_match.matched_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">
                    No specific skill matches verified.
                  </p>
                )}
              </div>

              {/* Missing Skills */}
              {university_match?.missing_skills && university_match.missing_skills.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <AlertTriangle size={12} /> External / Interdisciplinary Gaps
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {university_match.missing_skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* 8. Field Logistics Summary */}
            <section className="bg-slate-50 border border-gray-200 rounded-3xl p-6">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Field Logistics Summary
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Location:</span>
                  <span className="font-semibold text-gray-800 text-right">{location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Target Population:</span>
                  <span className="font-semibold text-gray-800">
                    {affected_people ? `${affected_people.toLocaleString()} citizens` : "Local community"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Reported On:</span>
                  <span className="font-semibold text-gray-800">{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-semibold text-purple-700 capitalize">{status}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </PageContainer>

      {/* Express Interest Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#071A33]">Express Challenge Interest</h3>
                  <p className="text-xs text-gray-400">Adopt civic problem for institutional research</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setSubmitError(null);
                }}
                className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 space-y-2">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Civic Challenge
                </span>
                <p className="text-xs font-bold text-gray-900 mt-0.5">{title}</p>
              </div>
              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                <span className="text-gray-500">Applying University:</span>
                <strong className="text-purple-700 font-bold">
                  {university_match?.university_name || "Your Institution"}
                </strong>
              </div>
            </div>

            {submitError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitInterest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Academic Capability & Intent Note (Optional)
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your relevant departmental laboratories, faculty mentors, or proposed student cohort focus..."
                  maxLength={1500}
                  className="w-full text-xs p-3.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none leading-relaxed text-gray-800"
                />
                <span className="text-[10px] text-gray-400 block text-right mt-1">
                  {message.length}/1500 characters
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSubmitError(null);
                  }}
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Submit Interest
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

