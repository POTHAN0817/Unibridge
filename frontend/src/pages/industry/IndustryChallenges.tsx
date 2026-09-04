import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, ArrowRight, MapPin, Users, Coins } from "lucide-react";
import { challengeService } from "../../services/challengeService";
import { Challenge } from "../../types";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { PriorityBadge } from "../../components/common/PriorityBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryChallenges() {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await challengeService.getAllChallenges();
      setChallenges(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <DashboardHeader
        badge="Industry Sponsorship Match"
        badgeColor="#F59E0B"
        title="Challenges & Projects Needing Industry Support"
        subtitle="Sponsor high-impact student prototypes through direct capital grants, technology kits, or engineering mentorship."
      />

      <PageContainer>
        {loading ? (
          <LoadingState message="Loading challenges..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/industry/challenges/${c.id}`)}
                className="bg-white border border-gray-200 rounded-3xl p-6 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800">
                        {c.category}
                      </span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                      Needs Hardware & Mentorship
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-[#071A33] group-hover:text-amber-600 transition-colors mb-2">
                    {c.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-3 mb-4">{c.description}</p>

                  <div className="p-3 rounded-xl bg-slate-50 border border-gray-100 text-xs mb-4">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Recommended Partner Contribution</span>
                    <p className="text-gray-700 font-medium mt-0.5">
                      IoT telemetry sensors, solar-charge controllers, and testing bench access.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {c.location}
                  </span>
                  <span className="font-bold text-amber-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Review & Sponsor <ArrowRight size={13} />
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
