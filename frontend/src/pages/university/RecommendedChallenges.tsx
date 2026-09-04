import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Brain, MapPin, Users, ArrowRight, Filter, Search } from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function RecommendedChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState("all");

  useEffect(() => {
    async function load() {
      const data = await challengeService.getAllChallenges();
      setChallenges(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = filterCat === "all" ? challenges : challenges.filter((c) => c.category === filterCat);

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="AI Matching Engine"
        badgeColor="#8B5CF6"
        title="AI-Recommended Societal Challenges"
        subtitle="Ranked by university department expertise, lab hardware availability, and local proximity."
      />

      <PageContainer>
        {/* Category filters */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {["all", "Agriculture", "Water & Sanitation", "Healthcare", "Education", "Environment"].map((cat) => (
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
          <LoadingState message="Calculating AI compatibility..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((c) => (
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
                      <span className="text-xs font-extrabold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                        {c.priorityScore}/100 Priority
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-[#071A33] group-hover:text-purple-600 transition-colors mb-2">
                    {c.title}
                  </h3>

                  <p className="text-xs text-gray-500 line-clamp-3 mb-4">{c.description}</p>

                  <div className="space-y-1.5 mb-4">
                    <div className="text-[11px] font-bold text-gray-400 uppercase">Required Competencies:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {c.requiredExpertise?.map((exp, i) => (
                        <span key={i} className="text-[11px] bg-slate-100 text-gray-700 px-2 py-0.5 rounded-md">
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {c.location}
                  </span>
                  <span className="text-purple-600 font-bold flex items-center gap-1">
                    Adopt for Campus Lab <ArrowRight size={13} />
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
