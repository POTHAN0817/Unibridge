import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Users, ArrowRight, Filter, Search, CheckCircle2 } from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function GovernmentChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const data = await challengeService.getAllChallenges();
      setChallenges(data);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = challenges.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="National Oversight Queue"
        badgeColor="#10B981"
        title="All Societal Challenges (National Registry)"
        subtitle="Comprehensive database of verified and unverified civic problems reported across districts."
      />

      <PageContainer>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title, district, or category..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="text-xs text-gray-500">
            Showing <strong>{filtered.length}</strong> national challenges
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading national registry..." />
        ) : (
          <div className="space-y-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/government/challenges/${c.id}`)}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-gray-700">
                      {c.category}
                    </span>
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} />
                    <span className="text-xs text-gray-400">ID: {c.id}</span>
                  </div>

                  <h3 className="text-base font-bold text-[#071A33] group-hover:text-emerald-700 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>

                  <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {c.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {c.affectedPeople} affected
                    </span>
                    {c.assignedUniversity && (
                      <span className="text-purple-700 font-medium">Assigned: {c.assignedUniversity}</span>
                    )}
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-emerald-600">{c.priorityScore}</span>
                    <span className="text-[10px] text-gray-400 block">AI Priority</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-2">
                    Review Details <ArrowRight size={13} />
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
