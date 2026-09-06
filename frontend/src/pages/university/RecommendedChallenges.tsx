import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Brain,
  MapPin,
  Users,
  ArrowRight,
  Filter,
  Search,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  Clock,
  AlertTriangle,
  Flame,
} from "lucide-react";
import { universityService } from "../../services/universityService";
import { UniversityMatchedChallenge, PriorityLevel } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { LoadingState } from "../../components/common/LoadingState";

type SortOption = "best_match" | "highest_priority" | "newest";

export default function RecommendedChallenges() {
  const navigate = useNavigate();

  const [challenges, setChallenges] = useState<UniversityMatchedChallenge[]>([]);
  const [interestsMap, setInterestsMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProfileIncomplete, setIsProfileIncomplete] = useState(false);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMatchLevel, setSelectedMatchLevel] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("best_match");

  async function loadMatchedChallenges() {
    setLoading(true);
    setError(null);
    setIsProfileIncomplete(false);
    try {
      const [data, interests] = await Promise.all([
        universityService.getMatchedChallenges(),
        universityService.getUniversityInterests().catch(() => []),
      ]);
      setChallenges(data);

      const imap: Record<string, string> = {};
      interests.forEach((item) => {
        if (item.challenge_id) {
          imap[item.challenge_id] = item.status;
        }
      });
      setInterestsMap(imap);
    } catch (err: any) {
      console.error("Failed to load university matched challenges:", err);
      const errMsg = typeof err?.message === "string" ? err.message : "";
      if (
        err?.status === 404 ||
        err?.status === 400 ||
        errMsg.toLowerCase().includes("profile")
      ) {
        setIsProfileIncomplete(true);
      } else {
        setError(errMsg || "Unable to connect to UniBridge server. Please verify the backend is running.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatchedChallenges();
  }, []);

  // Format challenge location object/string
  const formatLocation = (loc: any): string => {
    if (!loc) return "Location not specified";
    if (typeof loc === "string") return loc;
    if (typeof loc === "object") {
      return [loc.address, loc.district, loc.state].filter(Boolean).join(", ") || "Location not specified";
    }
    return "Location not specified";
  };

  // Extract Priority Level for Badge
  const getPriorityLevel = (c: UniversityMatchedChallenge): PriorityLevel => {
    const pScore = c.priority_score ?? (c.priority_analysis?.score || 0);
    if (pScore >= 70) return "HIGH";
    if (pScore >= 40) return "MEDIUM";
    return "LOW";
  };

  // Extract dynamically available categories from real returned data
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    challenges.forEach((c) => {
      if (c.category && c.category.trim()) {
        cats.add(c.category.trim());
      }
    });
    return Array.from(cats);
  }, [challenges]);

  // Extract dynamically available match levels from real returned data
  const availableMatchLevels = useMemo(() => {
    const levels = new Set<string>();
    challenges.forEach((c) => {
      if (c.match_level && c.match_level.trim()) {
        levels.add(c.match_level.trim());
      }
    });
    return Array.from(levels);
  }, [challenges]);

  // Filter and sort challenges
  const filteredAndSortedChallenges = useMemo(() => {
    let result = challenges.filter((c) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const titleMatch = c.title.toLowerCase().includes(q);
        const descMatch = c.description.toLowerCase().includes(q);
        const catMatch = c.category.toLowerCase().includes(q);
        const subcatMatch = c.subcategory ? c.subcategory.toLowerCase().includes(q) : false;
        const locMatch = formatLocation(c.location).toLowerCase().includes(q);
        const skillMatch = c.matched_skills.some((s) => s.toLowerCase().includes(q));
        if (!titleMatch && !descMatch && !catMatch && !subcatMatch && !locMatch && !skillMatch) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== "all" && c.category !== selectedCategory) {
        return false;
      }

      // Match level filter
      if (selectedMatchLevel !== "all" && c.match_level !== selectedMatchLevel) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== "all") {
        const pLevel = getPriorityLevel(c);
        if (pLevel !== selectedPriority) {
          return false;
        }
      }

      return true;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "best_match") {
        return (b.match_score || 0) - (a.match_score || 0);
      }
      if (sortBy === "highest_priority") {
        const aPrio = a.priority_score ?? (a.priority_analysis?.score || 0);
        const bPrio = b.priority_score ?? (b.priority_analysis?.score || 0);
        return bPrio - aPrio;
      }
      if (sortBy === "newest") {
        const aDate = new Date(a.created_at || 0).getTime();
        const bDate = new Date(b.created_at || 0).getTime();
        return bDate - aDate;
      }
      return 0;
    });

    return result;
  }, [challenges, searchQuery, selectedCategory, selectedMatchLevel, selectedPriority, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedMatchLevel("all");
    setSelectedPriority("all");
    setSortBy("best_match");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedMatchLevel !== "all" ||
    selectedPriority !== "all";

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="AI Capability Matcher"
        badgeColor="#8B5CF6"
        title="AI-Matched Societal Challenges"
        subtitle="Citizen challenges dynamically evaluated and ranked against your university's real departmental expertise, faculty research, and laboratory capabilities."
      >
        <Link
          to="/university/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs cursor-pointer"
        >
          <Building2 size={15} /> Edit Capabilities
        </Link>
      </DashboardHeader>

      <PageContainer>
        {/* State 1: Loading */}
        {loading && (
          <LoadingState message="Evaluating citizen challenges with your university capabilities..." />
        )}

        {/* State 2: Profile Incomplete */}
        {!loading && isProfileIncomplete && (
          <div className="bg-slate-50 border border-purple-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 my-8 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Building2 size={26} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#071A33]">
                Complete your university profile to receive relevant challenge matches.
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mt-1.5">
                The UniBridge matching engine requires your registered departments, faculty research leads, and technical equipment to calculate explainable compatibility scores.
              </p>
            </div>
            <div>
              <Link
                to="/university/profile"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
              >
                Complete Institutional Profile <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* State 3: API Error */}
        {!loading && !isProfileIncomplete && error && (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3 my-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-red-900">Failed to load challenge matches</h3>
            <p className="text-xs text-red-700 leading-relaxed max-w-md mx-auto">{error}</p>
            <div className="pt-2">
              <button
                onClick={loadMatchedChallenges}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-xs cursor-pointer"
              >
                Retry Request
              </button>
            </div>
          </div>
        )}

        {/* State 4: No Challenges in System */}
        {!loading && !isProfileIncomplete && !error && challenges.length === 0 && (
          <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3 my-8 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Brain size={24} />
            </div>
            <h3 className="text-base font-bold text-[#071A33]">No matching challenges available yet.</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When citizens submit societal challenges requiring your institution's specific departments, laboratories, or research skills, they will dynamically appear here with factual match explanations.
            </p>
            <div className="pt-2">
              <Link
                to="/university/profile"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
              >
                Review Capability Profile <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        )}

        {/* State 5: Active Challenges Available */}
        {!loading && !isProfileIncomplete && !error && challenges.length > 0 && (
          <div className="space-y-6">
            {/* Control Bar: Search, Filters & Sorting */}
            <div className="bg-slate-50 border border-gray-200 rounded-2xl p-4 space-y-3">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full md:w-80">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by keyword, skill, location..."
                    className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-gray-200 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>

                {/* Sort By Controls */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                  <span className="text-xs font-semibold text-gray-500 whitespace-nowrap flex items-center gap-1">
                    <ArrowUpDown size={13} /> Sort:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    <option value="best_match">Best Match (Highest Score)</option>
                    <option value="highest_priority">Highest Priority</option>
                    <option value="newest">Newest First</option>
                  </select>

                  {hasActiveFilters && (
                    <button
                      onClick={resetFilters}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} /> Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Selectors */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mr-1">
                  Filters:
                </span>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">All Categories ({challenges.length})</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Match Level Filter */}
                <select
                  value={selectedMatchLevel}
                  onChange={(e) => setSelectedMatchLevel(e.target.value)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">All Match Levels</option>
                  {availableMatchLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>

                {/* Priority Filter */}
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-gray-200 text-gray-700 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">All Priorities</option>
                  <option value="HIGH">High Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="LOW">Low Priority</option>
                </select>

                <div className="ml-auto text-xs text-gray-400 font-medium">
                  Showing <strong className="text-gray-900">{filteredAndSortedChallenges.length}</strong> of {challenges.length}
                </div>
              </div>
            </div>

            {/* Filtered Empty State */}
            {filteredAndSortedChallenges.length === 0 ? (
              <div className="bg-slate-50 border border-gray-200 rounded-3xl p-10 text-center max-w-lg mx-auto space-y-2 my-8">
                <Search size={22} className="text-gray-400 mx-auto" />
                <h4 className="text-sm font-bold text-gray-900">No challenges match your active filters</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Try adjusting or clearing your search criteria, category selection, or match level.
                </p>
                <div className="pt-2">
                  <button
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer"
                  >
                    <RotateCcw size={13} /> Clear All Filters
                  </button>
                </div>
              </div>
            ) : (
              /* Challenge Cards Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredAndSortedChallenges.map((c) => {
                  const prioLevel = getPriorityLevel(c);
                  const locationStr = formatLocation(c.location);
                  const urgencyStr = c.urgency ? c.urgency.toUpperCase() : null;

                  return (
                    <div
                      key={c.challenge_id}
                      onClick={() => navigate(`/university/challenges/${c.challenge_id}`)}
                      className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        {/* Top Badges & Match Score */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                              {c.category}
                            </span>
                            {c.subcategory && (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                {c.subcategory}
                              </span>
                            )}
                            <PriorityBadge priority={prioLevel} />
                            {urgencyStr && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-gray-700">
                                {urgencyStr} Urgency
                              </span>
                            )}
                            {interestsMap[c.challenge_id] && (
                              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                                <Clock size={11} className="text-amber-600" />
                                Interest {interestsMap[c.challenge_id].toUpperCase()}
                              </span>
                            )}
                          </div>

                          <div className="text-right flex-shrink-0">
                            <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                              {c.match_score}/100 Match ({c.match_level})
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-base text-[#071A33] group-hover:text-purple-600 transition-colors mt-1 mb-2">
                          {c.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed">
                          {c.description}
                        </p>

                        {/* Relevant / Matched Skills */}
                        {c.matched_skills && c.matched_skills.length > 0 && (
                          <div className="space-y-1.5 mb-3.5">
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                              Matched Technical Competencies:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {c.matched_skills.map((skill, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[11px] bg-purple-50 text-purple-800 border border-purple-100 px-2 py-0.5 rounded-md font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Short Match Explanation */}
                        {c.explanation && (
                          <p className="text-[11px] text-gray-600 italic bg-slate-50 p-3 rounded-2xl border border-gray-100 mb-4 leading-relaxed">
                            "{c.explanation}"
                          </p>
                        )}
                      </div>

                      {/* Footer Info: Location, Affected People, Action */}
                      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-3 truncate">
                          <span className="flex items-center gap-1 truncate max-w-[200px]" title={locationStr}>
                            <MapPin size={12} className="flex-shrink-0 text-gray-400" /> {locationStr}
                          </span>
                          {c.affected_people && (
                            <span className="flex items-center gap-1 text-gray-500 flex-shrink-0">
                              <Users size={12} className="text-gray-400" /> {c.affected_people.toLocaleString()} affected
                            </span>
                          )}
                        </div>

                        <span className="text-purple-600 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform flex-shrink-0">
                          Inspect Opportunity <ArrowRight size={13} />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
