import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Brain,
  MapPin,
  Users,
  AlertTriangle,
  FolderGit2,
  Calendar,
  Sparkles,
  Copy,
  Tag,
  FileText,
  Building2,
  ExternalLink,
  ChevronLeft,
  MessageSquare,
  Send,
  Loader2,
  X,
  Layers,
} from "lucide-react";
import { governmentService } from "../../services/governmentService";
import {
  GovernmentChallengeDetail,
  GovernmentChallengeReview,
  GovernmentReviewDecision,
} from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentChallengeDetails() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();

  const [challenge, setChallenge] = useState<GovernmentChallengeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review modal state
  const [activeModal, setActiveModal] = useState<"validate" | "reject" | "clarification" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [clarificationRequest, setClarificationRequest] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    if (!challengeId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await governmentService.getChallengeDetail(challengeId);
      setChallenge(data);

      // Pre-fill modal state if existing review exists
      if (data.government_review) {
        setReviewNote(data.government_review.review_note || "");
        setClarificationRequest(data.government_review.clarification_request || "");
      }
    } catch (err: any) {
      console.error("Failed to load challenge dossier:", err);
      setError(err?.response?.data?.detail || "Could not retrieve challenge details from database.");
    } finally {
      setLoading(false);
    }
  }, [challengeId]);

  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  // Open modal with clean error state
  const handleOpenModal = (type: "validate" | "reject" | "clarification") => {
    setActiveModal(type);
    setFormError(null);
  };

  // Close modal
  const handleCloseModal = () => {
    setActiveModal(null);
    setFormError(null);
  };

  // Submit review (create or update)
  const handleSubmitReview = async () => {
    if (!challengeId || !challenge) return;
    setFormError(null);

    let decision: GovernmentReviewDecision = "pending";
    if (activeModal === "validate") decision = "validated";
    else if (activeModal === "reject") decision = "rejected";
    else if (activeModal === "clarification") decision = "clarification_required";

    // Strict validation
    if (decision === "rejected" && !reviewNote.trim()) {
      setFormError("A review note explaining the reason for rejection is required.");
      return;
    }

    if (decision === "clarification_required" && !clarificationRequest.trim()) {
      setFormError("Please specify what information or clarification is needed from the submitter.");
      return;
    }

    setSubmittingReview(true);
    try {
      const hasExistingReview = Boolean(challenge.government_review);
      if (hasExistingReview) {
        await governmentService.updateChallengeReview(challengeId, {
          decision,
          review_note: reviewNote.trim() || undefined,
          clarification_request: clarificationRequest.trim() || undefined,
        });
        setSuccessToast(`Government review updated to "${decision.replace('_', ' ').toUpperCase()}".`);
      } else {
        await governmentService.createChallengeReview(challengeId, {
          decision,
          review_note: reviewNote.trim() || undefined,
          clarification_request: clarificationRequest.trim() || undefined,
        });
        setSuccessToast(`Government review recorded: "${decision.replace('_', ' ').toUpperCase()}".`);
      }

      handleCloseModal();
      // Reload actual backend state
      await loadDetail();
    } catch (err: any) {
      console.error("Failed to submit review:", err);
      setFormError(err?.response?.data?.detail || "Failed to record official decision. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading government challenge dossier and AI analysis..." />;
  }

  if (error || !challenge) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 text-center bg-[#F8FAFC]">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Challenge Dossier Unavailable</h2>
        <p className="text-xs text-gray-500 max-w-md mb-6 leading-relaxed">
          {error || "The requested societal challenge could not be found or has been removed."}
        </p>
        <Link
          to="/government/challenges"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs"
        >
          <ChevronLeft size={14} /> Back to Command Center
        </Link>
      </div>
    );
  }

  const ai = challenge.ai_analysis || {};
  const duplicate = challenge.duplicate_analysis || {};
  const priority = challenge.priority_analysis || {};
  const factors = priority.factors || {};
  const review = challenge.government_review;
  const project = challenge.project_relationship;

  const locationText =
    challenge.location?.district && challenge.location?.state
      ? `${challenge.location.district}, ${challenge.location.state}`
      : challenge.location?.district || challenge.location?.state || "Location Unspecified";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <DashboardHeader
        backTo="/government/challenges"
        backLabel="Command Center"
        badge={`Oversight Dossier · ${challenge.challenge_id}`}
        badgeColor="#059669"
        title={challenge.title}
        subtitle={`${locationText} · Logged on ${new Date(challenge.created_at).toLocaleDateString()}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {challenge.category && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs border border-white/30">
              {challenge.category}
            </span>
          )}
          {priority.level && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white text-emerald-900 border border-white/40 shadow-xs">
              {priority.level} Priority ({priority.score || 0})
            </span>
          )}
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* SUCCESS TOAST */}
        {successToast && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
            <button
              onClick={() => setSuccessToast(null)}
              className="text-emerald-600 hover:text-emerald-900 text-xs font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT 2 COLUMNS: Challenge Data & Analyses */}
          <div className="lg:col-span-2 space-y-6">
            {/* A. PROBLEM OVERVIEW */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Citizen Problem Statement
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                  Status: {challenge.challenge_status.toUpperCase()}
                </span>
              </div>

              <h2 className="text-lg font-bold text-gray-900 mb-3">{challenge.title}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-6">
                {challenge.description}
              </p>

              {/* Photo Evidence if uploaded */}
              {challenge.image_url && (
                <div className="mb-6">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">
                    Citizen Photo Evidence
                  </span>
                  <div className="rounded-2xl overflow-hidden border border-gray-200 max-h-80 bg-slate-50">
                    <img
                      src={challenge.image_url}
                      alt="Citizen Problem Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Problem Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Location</span>
                  <strong className="text-gray-900 block mt-0.5">{locationText}</strong>
                  {challenge.location?.address && (
                    <span className="text-[10px] text-gray-400 block truncate">{challenge.location.address}</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Affected Citizens</span>
                  <strong className="text-emerald-700 block mt-0.5">
                    {challenge.affected_people !== undefined && challenge.affected_people !== null
                      ? `${challenge.affected_people} citizens`
                      : "Not specified"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Reported Urgency</span>
                  <strong className="text-gray-900 capitalize block mt-0.5">
                    {challenge.urgency || "Normal"}
                  </strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Reported Date</span>
                  <strong className="text-gray-900 block mt-0.5">
                    {new Date(challenge.created_at).toLocaleDateString()}
                  </strong>
                </div>
              </div>

              {/* Citizen Tags */}
              {challenge.citizen_tags && challenge.citizen_tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
                  <Tag size={12} className="text-gray-400" />
                  <span className="text-[11px] text-gray-400 font-medium">Citizen Tags:</span>
                  {challenge.citizen_tags.map((t, idx) => (
                    <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* B. AI ANALYSIS & NLP EXTRACTION */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Brain size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">AI Classification & Problem Analysis</h3>
                    <p className="text-[11px] text-gray-400">Automated NLP taxonomy mapping & skill extraction</p>
                  </div>
                </div>

                {ai.confidence !== undefined && ai.confidence !== null && (
                  <div className="text-right">
                    <span className="text-sm font-black text-purple-700">
                      {Math.round(ai.confidence * 100)}%
                    </span>
                    <span className="text-[10px] text-gray-400 block">Confidence</span>
                  </div>
                )}
              </div>

              {ai.summary && (
                <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 text-xs text-purple-950 leading-relaxed mb-5">
                  <strong className="block text-purple-900 font-bold mb-1">Synthesized Problem Summary:</strong>
                  {ai.summary}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                    AI Categorization
                  </span>
                  <div className="font-bold text-gray-900">{ai.category || challenge.category || "General"}</div>
                  {ai.subcategory && (
                    <div className="text-[11px] text-gray-500 mt-0.5">Subcategory: {ai.subcategory}</div>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">
                    AI Pipeline Status
                  </span>
                  <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                    <CheckCircle2 size={14} /> Analysis Completed
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Verified semantic model pass</div>
                </div>
              </div>

              {/* Keywords & Required Skills */}
              <div className="mt-5 space-y-3 pt-4 border-t border-gray-100">
                {ai.keywords && ai.keywords.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1.5">
                      Extracted Technical Keywords
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ai.keywords.map((kw: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 text-gray-700 font-medium">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ai.required_skills && ai.required_skills.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-gray-400 uppercase block mb-1.5">
                      Recommended Engineering & Research Skills
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {ai.required_skills.map((sk: string, i: number) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-medium">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* C. DUPLICATE DETECTION RESULTS */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Copy size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Vector Duplicate Detection</h3>
                    <p className="text-[11px] text-gray-400">Embedding similarity scan against platform registry</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    duplicate.status === "unique"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}
                >
                  {duplicate.status === "unique" ? "Unique Challenge" : "Potential Duplicate"}
                </span>
              </div>

              {duplicate.status === "unique" ? (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                  <div>
                    <strong className="block font-bold">No duplicate challenges detected</strong>
                    <span className="text-emerald-700">
                      Highest semantic similarity score across database is only{" "}
                      {Math.round((duplicate.highest_similarity || 0) * 100)}%, well below cluster threshold.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                    <div className="flex items-center gap-2 font-bold mb-1">
                      <AlertTriangle size={15} className="text-amber-600" />
                      Semantic overlap of {Math.round((duplicate.highest_similarity || 0) * 100)}% detected
                    </div>
                    <span>
                      This challenge shares high similarity with existing records in this district.
                      {duplicate.matched_challenge_id && ` Matched Reference: #${duplicate.matched_challenge_id}`}
                    </span>
                  </div>

                  {/* Candidates */}
                  {duplicate.candidates && duplicate.candidates.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <span className="text-[11px] font-bold text-gray-400 uppercase block">
                        Similar Challenge Matches
                      </span>
                      {duplicate.candidates.map((cand: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-gray-100 text-xs"
                        >
                          <span className="font-semibold text-gray-800 line-clamp-1">{cand.title}</span>
                          <span className="text-amber-700 font-bold shrink-0 ml-2">
                            {Math.round((cand.similarity || 0) * 100)}% Match
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* D. PRIORITY ENGINE BREAKDOWN */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Priority Engine & Urgency Scoring</h3>
                    <p className="text-[11px] text-gray-400">Multi-factor heuristic evaluation</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-600">
                    {priority.score || 0}/100
                  </span>
                  <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wider">
                    {priority.level || "Calculated"}
                  </span>
                </div>
              </div>

              {priority.explanation && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-gray-100 text-xs text-gray-700 leading-relaxed mb-6">
                  <strong className="block text-gray-900 font-bold mb-1">Score Explanation:</strong>
                  {priority.explanation}
                </div>
              )}

              {/* Factors */}
              {factors && Object.keys(factors).length > 0 && (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase block">
                    Calculated Factor Weights
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(factors).map(([factorKey, factorVal]) => {
                      const numVal = typeof factorVal === "number" ? factorVal : 0;
                      return (
                        <div key={factorKey} className="p-3 rounded-xl bg-slate-50 border border-gray-100 text-xs">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="capitalize text-gray-600 font-medium">
                              {factorKey.replace('_', ' ')}
                            </span>
                            <span className="font-bold text-gray-900">{numVal}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(0, numVal * 10))}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* E. EXISTING UNIVERSITY PROJECT RELATIONSHIP */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FolderGit2 size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">University Project Linkage</h3>
                  <p className="text-[11px] text-gray-400">Academic adoption and innovation workspace</p>
                </div>
              </div>

              {project ? (
                <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-4 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 uppercase">Project Name</span>
                      <h4 className="text-sm font-bold text-gray-900">{project.project_name}</h4>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-purple-100 text-purple-800 self-start sm:self-auto">
                      Stage: {project.lifecycle_stage || project.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-purple-100 text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">University</span>
                      <strong className="text-gray-900">{project.university_name || "Institution Registered"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Assigned Team</span>
                      <strong className="text-gray-900">{project.team_name || "Assigned Team"}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] font-bold uppercase">Project Status</span>
                      <strong className="text-purple-700 capitalize">{project.status}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-gray-500 text-center">
                  <p className="font-semibold text-gray-700 mb-1">No University Project Linked Yet</p>
                  <p className="text-[11px] text-gray-400">
                    Once validated by Government, this challenge will be prioritized in university matching queues.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Government Validation Control & Decision Box */}
          <div className="space-y-6">
            {/* F. CURRENT REVIEW STATUS & ACTION PANEL */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs sticky top-6">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h3 className="text-base font-bold text-gray-900">Government Validation</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-5">
                Official regulatory validation for civic platform progression. Government decisions do not alter citizen records and are logged with full audit attribution.
              </p>

              {/* Current Decision Badge & Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-gray-200 mb-5">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5">
                  Current Official Decision
                </span>

                {review ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {review.decision === "validated" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 size={14} /> Validated
                        </span>
                      )}
                      {review.decision === "clarification_required" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                          <HelpCircle size={14} /> Clarification Required
                        </span>
                      )}
                      {review.decision === "rejected" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle size={14} /> Rejected
                        </span>
                      )}
                      {review.decision === "pending" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-800">
                          <Clock size={14} /> Pending Review
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-gray-500 space-y-1">
                      {review.reviewed_at && (
                        <div>
                          Reviewed on: <strong>{new Date(review.reviewed_at).toLocaleString()}</strong>
                        </div>
                      )}
                      {review.officer_name && (
                        <div>
                          Officer: <strong>{review.officer_name}</strong>
                        </div>
                      )}
                    </div>

                    {review.review_note && (
                      <div className="pt-2 border-t border-gray-200 text-xs">
                        <span className="text-[10px] font-bold text-gray-400 uppercase block">Review Note:</span>
                        <p className="text-gray-700 mt-0.5 italic">{review.review_note}</p>
                      </div>
                    )}

                    {review.clarification_request && (
                      <div className="pt-2 border-t border-gray-200 text-xs">
                        <span className="text-[10px] font-bold text-amber-700 uppercase block">Clarification Request:</span>
                        <p className="text-amber-900 mt-0.5">{review.clarification_request}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <Clock size={15} /> Pending Government Review
                  </div>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-2.5">
                <button
                  onClick={() => handleOpenModal("validate")}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                >
                  <CheckCircle2 size={16} /> Validate Challenge
                </button>

                <button
                  onClick={() => handleOpenModal("clarification")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition-colors border border-amber-300 cursor-pointer"
                >
                  <HelpCircle size={16} /> Request Clarification
                </button>

                <button
                  onClick={() => handleOpenModal("reject")}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors border border-rose-200 cursor-pointer"
                >
                  <XCircle size={16} /> Reject Challenge
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* DECISION MODAL / CONFIRMATION DIALOG */}
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative">
              <button
                onClick={handleCloseModal}
                disabled={submittingReview}
                className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                {activeModal === "validate" && (
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={22} />
                  </div>
                )}
                {activeModal === "reject" && (
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <XCircle size={22} />
                  </div>
                )}
                {activeModal === "clarification" && (
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <HelpCircle size={22} />
                  </div>
                )}

                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {activeModal === "validate" && "Confirm Challenge Validation"}
                    {activeModal === "reject" && "Reject Challenge Validation"}
                    {activeModal === "clarification" && "Request Submitter Clarification"}
                  </h3>
                  <p className="text-xs text-gray-400">Official Government Decision</p>
                </div>
              </div>

              {formError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Modal Body */}
              <div className="space-y-4 text-xs">
                {activeModal === "validate" && (
                  <>
                    <p className="text-gray-600 leading-relaxed">
                      Validating this challenge officially acknowledges the civic priority and signals accredited universities that this issue has cleared governmental oversight.
                    </p>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Review Note / Administrative Remarks (Optional)
                      </label>
                      <textarea
                        rows={3}
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="e.g., Aligned with district water infrastructure priorities. Ready for university innovation."
                        className="w-full p-3 rounded-xl border border-gray-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-none text-xs"
                      />
                    </div>
                  </>
                )}

                {activeModal === "reject" && (
                  <>
                    <p className="text-gray-600 leading-relaxed">
                      Rejecting this challenge marks it as not validated for platform progression. A clear explanation is required for public audit accountability.
                    </p>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Reason for Rejection <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={reviewNote}
                        onChange={(e) => setReviewNote(e.target.value)}
                        placeholder="Detail why this challenge is not validated (e.g., Out of jurisdiction, commercial solicitation, duplicate already resolved)..."
                        className="w-full p-3 rounded-xl border border-rose-200 bg-slate-50 focus:bg-white focus:border-rose-600 focus:outline-none text-xs"
                      />
                    </div>
                  </>
                )}

                {activeModal === "clarification" && (
                  <>
                    <p className="text-gray-600 leading-relaxed">
                      Request specific details or evidence from the citizen submitter before an official decision can be concluded.
                    </p>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">
                        Clarification Details Required <span className="text-amber-500">*</span>
                      </label>
                      <textarea
                        rows={4}
                        value={clarificationRequest}
                        onChange={(e) => setClarificationRequest(e.target.value)}
                        placeholder="e.g., Please provide exact street junction or landmark, and clarify whether the pipeline burst is ongoing..."
                        className="w-full p-3 rounded-xl border border-amber-200 bg-slate-50 focus:bg-white focus:border-amber-600 focus:outline-none text-xs"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button
                  onClick={handleCloseModal}
                  disabled={submittingReview}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50 ${
                    activeModal === "validate"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : activeModal === "reject"
                      ? "bg-rose-600 hover:bg-rose-700"
                      : "bg-amber-600 hover:bg-amber-700"
                  }`}
                >
                  {submittingReview ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Recording Decision...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Submit Decision
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
