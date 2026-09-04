import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Users,
  Search,
  Filter,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Brain,
} from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { StatusBadge } from "../../components/common/StatusBadge";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { PageContainer } from "../../components/layout/PageContainer";
import { LoadingState } from "../../components/common/LoadingState";
import { EmptyState } from "../../components/common/EmptyState";

export default function CitizenChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    async function fetchChallenges() {
      const data = await challengeService.getAllChallenges();
      setChallenges(data);
      setLoading(false);
    }
    fetchChallenges();
  }, []);

  const categories = ["all", ...new Set(challenges.map((c) => c.category))];

  const filtered = challenges.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === "all" || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Citizen Submissions"
        title="My Reported Challenges"
        subtitle="Track every challenge submitted by you or your community collective."
      >
        <Link
          to="/citizen/report"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xs"
        >
          <PlusCircle size={16} /> Report Challenge
        </Link>
      </DashboardHeader>

      <PageContainer>
        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search challenges or locations..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-gray-200 rounded-xl focus:bg-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
            <span className="text-xs text-gray-400 font-semibold flex items-center gap-1">
              <Filter size={13} /> Filter:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content list */}
        {loading ? (
          <LoadingState message="Loading your challenges..." />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No challenges found"
            description="No community challenges match your current search criteria."
            actionText="Report a New Challenge"
            onAction={() => navigate("/citizen/report")}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/citizen/challenges/${c.id}`)}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {c.category}
                      </span>
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                      <span className="text-[11px] text-gray-400">ID: {c.id}</span>
                    </div>

                    <h3 className="text-base font-bold text-[#071A33] group-hover:text-blue-600 transition-colors">
                      {c.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{c.description}</p>

                    <div className="flex flex-wrap gap-4 text-xs text-gray-400 mt-3">
                      <span className="flex items-center gap-1 text-gray-600">
                        <MapPin size={12} /> {c.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {c.similarReports} reports merged
                      </span>
                      <span className="flex items-center gap-1 text-emerald-600 font-medium">
                        <TrendingUp size={12} /> {c.affectedPeople} impacted
                      </span>
                      <span>Submitted on {c.submittedDate}</span>
                    </div>
                  </div>

                  {/* AI Score & Stage */}
                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0 border-gray-100 flex-shrink-0">
                    <div className="text-right">
                      <div
                        className="text-2xl font-extrabold"
                        style={{
                          color: c.priorityScore >= 80 ? "#EF4444" : "#F59E0B",
                          fontFamily: "var(--font-display)",
                        }}
                      >
                        {c.priorityScore}/100
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium">AI Priority Score</div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-blue-600 mt-2">
                      <span>View Roadmap</span>
                      <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
