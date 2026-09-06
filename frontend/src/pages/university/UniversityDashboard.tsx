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
  CheckCircle2,
} from "lucide-react";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { useAuth } from "../../auth/AuthContext";
import { universityService } from "../../services/universityService";
import { UniversityMatchedChallenge, UniversityProfile, UniversityInterest } from "../../types";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";

export default function UniversityDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [matchedItems, setMatchedItems] = useState<UniversityMatchedChallenge[]>([]);
  const [myInterests, setMyInterests] = useState<UniversityInterest[]>([]);
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(0);
  const [tab, setTab] = useState<"recommended" | "interests" | "active" | "teams">("recommended");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [matches, prof, interests] = await Promise.all([
          universityService.getMatchedChallenges().catch(() => []),
          universityService.getMyProfile().catch(() => null),
          universityService.getUniversityInterests().catch(() => []),
        ]);
        setMatchedItems(matches);
        setProfile(prof);
        setMyInterests(interests);
      } catch (err) {
        console.error("Failed to load university dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectedChallenge = matchedItems[selectedChallengeIndex] || matchedItems[0];
  const selectedEval = selectedChallenge?.match_evaluation;

  const formatLocation = (loc: any): string => {
    if (!loc) return "Location not specified";
    if (typeof loc === "string") return loc;
    if (typeof loc === "object") {
      return [loc.address, loc.district, loc.state].filter(Boolean).join(", ") || "Location not specified";
    }
    return "Location not specified";
  };

  const facultyCount = profile?.faculty?.length || 0;
  const institutionName = profile?.name || user?.organization || (user?.profile as Record<string, any>)?.university_name || "INSTITUTIONAL INNOVATION CENTER";
  const campusLocation = typeof profile?.location === "string"
    ? profile.location
    : profile?.location?.city || user?.district || user?.state || "National";

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <DashboardHeader
        badge={institutionName}
        badgeColor="#8B5CF6"
        title="University Innovation & Faculty Command Center"
        subtitle="AI-matched societal challenges, student-faculty multidisciplinary teams, and real-world pilot projects."
      >
        <Link
          to="/university/profile"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs"
        >
          <Layers size={15} /> Institutional Profile
        </Link>
      </DashboardHeader>

      <PageContainer>
        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Matched Challenges"
            value={matchedItems.length.toString().padStart(2, "0")}
            icon={Brain}
            color="#8B5CF6"
            subtext="AI Capability Matches"
          />
          <StatCard
            label="Challenge Interests"
            value={myInterests.length.toString().padStart(2, "0")}
            icon={Sparkles}
            color="#10B981"
            subtext="Expressed Adoptions"
          />
          <StatCard
            label="Faculty Mentors"
            value={facultyCount.toString().padStart(2, "0")}
            icon={Users}
            color="#8B5CF6"
            subtext="Registered Research Leads"
          />
          <StatCard
            label="Campus Research Focus"
            value={campusLocation}
            icon={MapPin}
            color="#0B63F6"
            subtext="Regional Innovation Hub"
          />
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: "recommended", label: `AI-Matched Challenges (${matchedItems.length})` },
            { id: "interests", label: `My Challenge Interests (${myInterests.length})` },
            { id: "active", label: "Active Campus Projects (0)" },
            { id: "teams", label: `Faculty Mentors (${facultyCount})` },
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
          matchedItems.length === 0 ? (
            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <Brain size={24} />
              </div>
              <h3 className="text-base font-bold text-[#071A33]">No matching challenges yet.</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                As citizens report problems in domains relevant to your department expertise and lab capabilities, they will be dynamically evaluated and displayed here.
              </p>
              <Link
                to="/university/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
              >
                Update Profile Capabilities <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left list (2 cols) */}
              <div className="lg:col-span-2 space-y-4">
                {matchedItems.map((c, idx) => (
                  <div
                    key={c.challenge_id}
                    onClick={() => setSelectedChallengeIndex(idx)}
                    className={`rounded-2xl p-5 border transition-all cursor-pointer ${
                      selectedChallengeIndex === idx
                        ? "bg-purple-50/50 border-purple-300 shadow-sm"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">
                          {c.category}
                        </span>
                        <PriorityBadge priority={c.priority_analysis?.level || c.urgency || "medium"} />
                      </div>
                      <span className="text-xs font-extrabold text-purple-700 bg-white border border-purple-200 px-2 py-0.5 rounded-md">
                        {c.match_score || 0}/100 Match
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#071A33] mb-1.5">{c.title}</h3>
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">{c.description}</p>

                    <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} /> {formatLocation(c.location)}
                      </span>
                      <span className="text-purple-600 font-semibold inline-flex items-center gap-1">
                        Inspect Challenge <ArrowRight size={12} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Evaluation Summary (1 col) */}
              {selectedChallenge && (
                <div className="space-y-6">
                  <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                      <Brain size={18} className="text-purple-600" />
                      <h3 className="text-sm font-bold text-[#071A33]">AI Compatibility Breakdown</h3>
                    </div>

                    <div className="text-center py-2">
                      <div className="text-3xl font-extrabold text-purple-600">
                        {selectedChallenge.match_score || 0}/100
                      </div>
                      <div className="text-xs font-bold text-gray-700 mt-1">{selectedChallenge.match_level || "Evaluated Match"}</div>
                    </div>

                    {selectedEval?.factors && (
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expertise Similarity (40%)</span>
                          <span className="font-bold text-gray-800">{selectedEval.factors.expertise_similarity}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Skill Match (20%)</span>
                          <span className="font-bold text-gray-800">{selectedEval.factors.skill_match}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Past Projects (15%)</span>
                          <span className="font-bold text-gray-800">{selectedEval.factors.previous_project_match}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Lab Infrastructure (10%)</span>
                          <span className="font-bold text-gray-800">{selectedEval.factors.infrastructure_match}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location Proximity (10%)</span>
                          <span className="font-bold text-gray-800">{selectedEval.factors.location_relevance}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Capacity Availability (5%)</span>
                          <span className="font-bold text-gray-800">{selectedEval.factors.availability}%</span>
                        </div>
                      </div>
                    )}

                    {(selectedChallenge.explanation || selectedEval?.explanation) && (
                      <p className="text-[11px] text-gray-600 italic bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                        "{selectedChallenge.explanation || selectedEval?.explanation}"
                      </p>
                    )}

                    <Link
                      to={`/university/challenges/${selectedChallenge.challenge_id}`}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                    >
                      View Problem Statement & Field Dossier <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        {/* Tab: My Challenge Interests */}
        {tab === "interests" && (
          myInterests.length === 0 ? (
            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <Sparkles size={24} />
              </div>
              <h3 className="text-base font-bold text-[#071A33]">No challenge interests yet.</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Explore your institutional AI-matched civic challenges and express interest to signal adoption intent and launch student-faculty project initiatives.
              </p>
              <button
                onClick={() => setTab("recommended")}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
              >
                Explore Matched Challenges <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-[#071A33]">My Challenge Interests</h2>
                  <p className="text-xs text-gray-500">Real interest submissions and civic challenge adoptions by your institution</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
                  {myInterests.length} {myInterests.length === 1 ? "Record" : "Records"}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {myInterests.map((interest) => {
                  const dateStr = interest.created_at
                    ? new Date(interest.created_at).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Recently";

                  const statusConfig = {
                    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", label: "Pending Review" },
                    accepted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", label: "Accepted" },
                    rejected: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200", label: "Declined" },
                    withdrawn: { bg: "bg-gray-50", text: "text-gray-600", border: "border-gray-200", label: "Withdrawn" },
                  }[interest.status] || {
                    bg: "bg-purple-50",
                    text: "text-purple-700",
                    border: "border-purple-200",
                    label: interest.status,
                  };

                  return (
                    <div
                      key={interest._id || interest.id}
                      className="bg-white border border-gray-200 hover:border-purple-300 rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                          >
                            <Clock size={11} />
                            {statusConfig.label}
                          </span>
                          {(interest.challenge_category || interest.challenge?.category) && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                              {interest.challenge_category || interest.challenge?.category}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-400">
                            Submitted: {dateStr}
                          </span>
                        </div>

                        <h4 className="text-sm font-bold text-[#071A33] truncate">
                          {interest.challenge_title || interest.challenge?.title || "Civic Challenge"}
                        </h4>

                        {interest.message && (
                          <p className="text-xs text-gray-600 italic bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 line-clamp-2">
                            "{interest.message}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Link
                          to={`/university/challenges/${interest.challenge_id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors shadow-xs"
                        >
                          View Challenge Dossier <ArrowRight size={13} />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Tab 2: Active Projects */}
        {tab === "active" && (
          <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Zap size={24} />
            </div>
            <h3 className="text-base font-bold text-[#071A33]">No active campus projects yet.</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When your departments adopt AI-matched civic challenges, multidisciplinary student-faculty teams and live pilot development workspaces will appear here.
            </p>
            <button
              onClick={() => setTab("recommended")}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
            >
              Browse AI-Matched Challenges <ArrowRight size={14} />
            </button>
          </div>
        )}

        {/* Tab 3: Faculty & Teams */}
        {tab === "teams" && (
          !profile?.faculty || profile.faculty.length === 0 ? (
            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <Users size={24} />
              </div>
              <h3 className="text-base font-bold text-[#071A33]">No faculty mentors registered yet.</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Add professors, lab directors, and principal investigators to your institutional profile so they can supervise student research cohorts.
              </p>
              <Link
                to="/university/faculty"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
              >
                Manage Faculty Mentors <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profile.faculty.map((fac, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                        {fac.name?.trim().charAt(0) || "F"}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#071A33]">{fac.name}</h4>
                        <p className="text-[11px] text-gray-400">{fac.department || "Academic Department"}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4 text-xs">
                      {fac.designation && (
                        <div className="flex justify-between text-gray-600">
                          <span>Designation:</span>
                          <strong className="text-gray-900">{fac.designation}</strong>
                        </div>
                      )}
                      {fac.email && (
                        <div className="flex justify-between text-gray-600">
                          <span>Email:</span>
                          <span className="text-gray-700 truncate max-w-[150px]">{fac.email}</span>
                        </div>
                      )}
                      {fac.expertise && fac.expertise.length > 0 && (
                        <div className="pt-2 border-t border-gray-100">
                          <span className="text-[11px] text-gray-400 block mb-1">Research Expertise:</span>
                          <div className="flex flex-wrap gap-1">
                            {fac.expertise.map((exp, eIdx) => (
                              <span key={eIdx} className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                                {exp}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/university/faculty"
                    className="w-full text-center py-2 px-3 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                  >
                    View Faculty Roster
                  </Link>
                </div>
              ))}
            </div>
          )
        )}
      </PageContainer>
    </div>
  );
}
