import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, MapPin, Users, ArrowRight, Filter, Search } from "lucide-react";
import { universityService } from "../../services/universityService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function RecommendedChallenges() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Array<{ challenge: Challenge; matchEvaluation: any }>>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await universityService.getMatchedChallenges();
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filterCat === "all" ? items : items.filter((it) => it.challenge.category === filterCat);

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="AI Capability Matcher"
        badgeColor="#8B5CF6"
        title="AI-Matched Societal Challenges"
        subtitle="Challenges dynamically matched against your university's real departmental expertise, faculty research, and laboratory equipment."
      />

      <PageContainer>
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {["all", "Agriculture", "Water & Sanitation", "Healthcare", "Education", "Environment", "Energy"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterCat === cat
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <LoadingState message="Matching challenges with your university capabilities..." />
        ) : filtered.length === 0 ? (
          <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
              <Brain size={24} />
            </div>
            <h3 className="text-base font-bold text-[#071A33]">No matching challenges yet.</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              When citizens submit challenges requiring your institution's specific skills, laboratories, or research domains, they will automatically appear here with a transparent match breakdown.
            </p>
            <Link
              to="/university/profile"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-xs"
            >
              Update Institutional Capabilities <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(({ challenge: c, matchEvaluation }) => (
              <div
                key={c.id}
                onClick={() => navigate(`/university/challenges/${c.id}`)}
                className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700">
                        {c.category}
                      </span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                        {matchEvaluation?.score || 0}/100 Match ({matchEvaluation?.level || "Good Match"})
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-[#071A33] group-hover:text-purple-600 transition-colors mb-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-3 mb-4">{c.description}</p>

                  {matchEvaluation?.matched_skills && matchEvaluation.matched_skills.length > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <div className="text-[11px] font-bold text-gray-400 uppercase">Matched Department Competencies:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {matchEvaluation.matched_skills.map((exp: string, i: number) => (
                          <span key={i} className="text-[11px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-md font-medium">
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {matchEvaluation?.explanation && (
                    <p className="text-[11px] text-gray-600 italic bg-slate-50 p-2.5 rounded-xl border border-gray-100 mb-4">
                      "{matchEvaluation.explanation}"
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {c.location}
                  </span>
                  <span className="text-purple-600 font-bold flex items-center gap-1">
                    Evaluate Problem <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}

