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
  FolderGit2,
  Rocket,
  GraduationCap,
  Briefcase,
  Target,
  ExternalLink,
  Handshake,
} from "lucide-react";
import { useAuth } from "../../auth/AuthContext";
import { universityService } from "../../services/universityService";
import {
  UniversityMatchedChallenge,
  UniversityProfile,
  UniversityInterest,
  UniversityProject,
  UniversityTeam,
  FacultyMember,
  StudentMember,
  UniversityIndustryCollaborationMetrics,
} from "../../types";
import { StatCard } from "../../components/dashboard/StatCard";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function UniversityDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [matchedItems, setMatchedItems] = useState<UniversityMatchedChallenge[]>([]);
  const [myInterests, setMyInterests] = useState<UniversityInterest[]>([]);
  const [projects, setProjects] = useState<UniversityProject[]>([]);
  const [teams, setTeams] = useState<UniversityTeam[]>([]);
  const [facultyList, setFacultyList] = useState<FacultyMember[]>([]);
  const [studentList, setStudentList] = useState<StudentMember[]>([]);
  const [profile, setProfile] = useState<UniversityProfile | null>(null);
  const [collabMetrics, setCollabMetrics] = useState<UniversityIndustryCollaborationMetrics | null>(null);

  const [selectedChallengeIndex, setSelectedChallengeIndex] = useState(0);
  const [tab, setTab] = useState<"recommended" | "interests" | "projects" | "teams" | "faculty">("recommended");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [matches, prof, interests, projData, teamData, facData, studData, metrics] = await Promise.all([
          universityService.getMatchedChallenges().catch(() => []),
          universityService.getMyProfile().catch(() => null),
          universityService.getUniversityInterests().catch(() => []),
          universityService.getProjectList().catch(() => []),
          universityService.getTeamList().catch(() => []),
          universityService.getFacultyList().catch(() => []),
          universityService.getStudentList().catch(() => []),
          universityService.getIndustryCollaborationMetrics().catch(() => null),
        ]);
        setMatchedItems(matches || []);
        setProfile(prof);
        setMyInterests(interests || []);
        setProjects(projData || []);
        setTeams(teamData || []);
        setFacultyList(facData || []);
        setStudentList(studData || []);
        setCollabMetrics(metrics);
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

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status !== "completed" && p.status !== "archived").length;
  const advancedPhaseProjects = projects.filter((p) => ["prototype", "pilot", "deployment"].includes(p.status)).length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const totalFaculty = facultyList.length || profile?.faculty?.length || 0;
  const totalStudents = studentList.length;

  const institutionName =
    profile?.name ||
    user?.organization ||
    (user?.profile as Record<string, any>)?.university_name ||
    "INSTITUTIONAL INNOVATION CENTER";

  const campusLocation =
    typeof profile?.location === "string"
      ? profile.location
      : profile?.location?.city || user?.district || user?.state || "National";

  if (loading) {
    return <LoadingState message="Loading university innovation metrics & research workspaces..." />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Banner */}
      <DashboardHeader
        badge={institutionName}
        badgeColor="#8B5CF6"
        title="University Innovation & Faculty Command Center"
        subtitle="AI-matched societal challenges, student-faculty multidisciplinary teams, and real-world pilot projects."
      >
        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/university/projects"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-all border border-purple-200"
          >
            <FolderGit2 size={14} /> Workspaces ({totalProjects})
          </Link>
          <Link
            to="/university/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-xs"
          >
            <Layers size={14} /> Profile
          </Link>
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* Quick Navigation Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          <Link
            to="/university/challenges"
            className="p-3.5 bg-purple-50/60 hover:bg-purple-100/70 rounded-2xl border border-purple-100 transition-all text-center group"
          >
            <Brain size={18} className="text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-800 block">Matched Challenges</span>
            <span className="text-xs font-black text-purple-700">{matchedItems.length} Available</span>
          </Link>

          <button
            onClick={() => setTab("interests")}
            className="p-3.5 bg-emerald-50/60 hover:bg-emerald-100/70 rounded-2xl border border-emerald-100 transition-all text-center group cursor-pointer"
          >
            <Sparkles size={18} className="text-emerald-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-800 block">Expressed Interests</span>
            <span className="text-xs font-black text-emerald-700">{myInterests.length} Records</span>
          </button>

          <Link
            to="/university/projects"
            className="p-3.5 bg-blue-50/60 hover:bg-blue-100/70 rounded-2xl border border-blue-100 transition-all text-center group"
          >
            <FolderGit2 size={18} className="text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-800 block">Active Projects</span>
            <span className="text-xs font-black text-blue-700">{totalProjects} Workspaces</span>
          </Link>

          <Link
            to="/university/teams"
            className="p-3.5 bg-indigo-50/60 hover:bg-indigo-100/70 rounded-2xl border border-indigo-100 transition-all text-center group"
          >
            <Users size={18} className="text-indigo-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-800 block">Innovation Teams</span>
            <span className="text-xs font-black text-indigo-700">{teams.length} Formed</span>
          </Link>

          <Link
            to="/university/faculty"
            className="p-3.5 bg-violet-50/60 hover:bg-violet-100/70 rounded-2xl border border-violet-100 transition-all text-center group"
          >
            <Briefcase size={18} className="text-violet-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-800 block">Faculty Roster</span>
            <span className="text-xs font-black text-violet-700">{totalFaculty} Mentors</span>
          </Link>

          <Link
            to="/university/students"
            className="p-3.5 bg-sky-50/60 hover:bg-sky-100/70 rounded-2xl border border-sky-100 transition-all text-center group"
          >
            <GraduationCap size={18} className="text-sky-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold text-gray-800 block">Student Innovators</span>
            <span className="text-xs font-black text-sky-700">{totalStudents} Enrolled</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Projects"
            value={totalProjects.toString().padStart(2, "0")}
            icon={FolderGit2}
            color="#8B5CF6"
            subtext={`${activeProjects} active initiatives`}
          />
          <StatCard
            label="Prototypes & Pilots"
            value={advancedPhaseProjects.toString().padStart(2, "0")}
            icon={Rocket}
            color="#10B981"
            subtext={`${completedProjects} completed solutions`}
          />
          <StatCard
            label="Faculty Mentors"
            value={totalFaculty.toString().padStart(2, "0")}
            icon={Briefcase}
            color="#6366F1"
            subtext="Supervising researchers"
          />
          <StatCard
            label="Student Innovators"
            value={totalStudents.toString().padStart(2, "0")}
            icon={GraduationCap}
            color="#0B63F6"
            subtext="Active student roster"
          />
        </div>

        {/* Industry Collaboration Metrics Bar */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-3xl p-6 mb-8 text-white shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  <Handshake size={12} /> Industry Collaboration
                </span>
              </div>
              <h3 className="text-base font-extrabold text-white">Corporate Innovation & Mentorship Network</h3>
              <p className="text-xs text-purple-200/80 max-w-xl">
                Real-time tracking of corporate partnership requests, accepted industry alliances, and active corporate technical mentors across campus project workspaces.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-3 text-center">
                <span className="text-[11px] text-purple-200 block font-medium">Pending Requests</span>
                <span className="text-xl font-black text-amber-300">
                  {collabMetrics?.pending_requests ?? collabMetrics?.pending_partnership_requests ?? 0}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-3 text-center">
                <span className="text-[11px] text-purple-200 block font-medium">Active Partners</span>
                <span className="text-xl font-black text-emerald-400">
                  {collabMetrics?.active_partnerships ?? 0}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-3 text-center">
                <span className="text-[11px] text-purple-200 block font-medium">Projects Partnered</span>
                <span className="text-xl font-black text-white">
                  {collabMetrics?.projects_with_partnerships ?? 0}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-3 text-center">
                <span className="text-[11px] text-purple-200 block font-medium">Active Mentors</span>
                <span className="text-xl font-black text-purple-300">
                  {collabMetrics?.active_mentors ?? 0}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-3 text-center">
                <span className="text-[11px] text-purple-200 block font-medium">Resources Pledged</span>
                <span className="text-xl font-black text-cyan-300">
                  {collabMetrics?.resource_contributions ?? 0}
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-2xl px-3.5 py-3 text-center">
                <span className="text-[11px] text-purple-200 block font-medium">Funding Proposals</span>
                <span className="text-xl font-black text-rose-300">
                  {collabMetrics?.funding_proposals ?? 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
          {[
            { id: "recommended", label: `AI-Matched Challenges (${matchedItems.length})` },
            { id: "interests", label: `My Challenge Interests (${myInterests.length})` },
            { id: "projects", label: `Active Campus Projects (${totalProjects})` },
            { id: "teams", label: `Innovation Teams (${teams.length})` },
            { id: "faculty", label: `Faculty Mentors (${totalFaculty})` },
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

        {/* Tab 3: Active Projects */}
        {tab === "projects" && (
          projects.length === 0 ? (
            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <FolderGit2 size={24} />
              </div>
              <h3 className="text-base font-bold text-[#071A33]">No campus project workspaces yet.</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                When your institution forms multidisciplinary teams to solve adopted civic challenges, launch dedicated project workspaces to coordinate research, build prototypes, and deploy field pilots.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                <Link
                  to="/university/teams"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
                >
                  <Users size={14} /> Form an Innovation Team First
                </Link>
                <Link
                  to="/university/projects"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-gray-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Go to Projects <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-[#071A33]">Institutional R&D Workspaces</h3>
                  <p className="text-xs text-gray-500">Live project initiatives addressing adopted civic challenges</p>
                </div>
                <Link
                  to="/university/projects"
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                >
                  Manage All Projects <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="bg-white border border-gray-200/90 hover:border-purple-300 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-100 uppercase">
                          {proj.challenge_category || "Civic Innovation"}
                        </span>
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 uppercase">
                          {proj.status.replace("_", " ")}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-bold text-[#071A33] line-clamp-1">{proj.name}</h4>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                          {proj.description || "No project description provided."}
                        </p>
                      </div>

                      {/* Milestone progress bar */}
                      <div className="bg-slate-50 rounded-xl p-2.5 border border-gray-100 space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-500 font-medium">Milestones</span>
                          <span className="font-bold text-gray-900">{proj.milestone_progress ?? 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-purple-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${proj.milestone_progress ?? 0}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-[11px] text-gray-500 space-y-1">
                        <div>Team: <strong className="text-gray-800">{proj.team_name}</strong></div>
                        <div className="truncate">Target: <strong className="text-gray-800">{proj.challenge_title}</strong></div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                      <Link
                        to={`/university/projects/${proj.id}`}
                        className="w-full text-center py-2 px-3 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs inline-flex items-center justify-center gap-1.5"
                      >
                        Open Workspace <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Tab 4: Teams */}
        {tab === "teams" && (
          teams.length === 0 ? (
            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                <Users size={24} />
              </div>
              <h3 className="text-base font-bold text-[#071A33]">No innovation teams formed yet.</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Connect faculty mentors and student researchers to adopted civic challenges to form multidisciplinary research teams.
              </p>
              <Link
                to="/university/teams"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
              >
                <Users size={14} /> Form Innovation Team
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <div>
                  <h3 className="text-sm font-bold text-[#071A33]">Multidisciplinary Innovation Teams</h3>
                  <p className="text-xs text-gray-500">Student and faculty cohorts tackling civic challenges</p>
                </div>
                <Link
                  to="/university/teams"
                  className="text-xs font-bold text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
                >
                  Manage Teams <ArrowRight size={13} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {teams.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white border border-gray-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-[#071A33]">{t.name}</h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                          {t.status}
                        </span>
                      </div>

                      <div className="p-2.5 bg-purple-50/50 rounded-xl border border-purple-100/70 text-xs">
                        <span className="text-[10px] font-bold text-purple-700 uppercase block mb-0.5">Challenge</span>
                        <div className="font-semibold text-gray-800 line-clamp-1">{t.challenge_title || "Civic Challenge"}</div>
                      </div>

                      <div className="space-y-1 text-xs text-gray-600">
                        <div>Mentors: <strong className="text-gray-800">{t.faculty_members.length}</strong></div>
                        <div>Students: <strong className="text-gray-800">{t.student_members.length}</strong></div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-gray-100">
                      <Link
                        to="/university/teams"
                        className="w-full text-center py-2 px-3 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors inline-block"
                      >
                        Inspect Team Roster
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        )}

        {/* Tab 5: Faculty */}
        {tab === "faculty" && (
          facultyList.length === 0 ? (
            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
                <Briefcase size={24} />
              </div>
              <h3 className="text-base font-bold text-[#071A33]">No faculty mentors registered yet.</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Add professors, lab directors, and principal investigators to your institutional roster so they can supervise student research cohorts.
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
              {facultyList.map((fac) => (
                <div
                  key={fac.id}
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

