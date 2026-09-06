import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardHeader } from "../../components/dashboard/DashboardHeader";
import { PageContainer } from "../../components/layout/PageContainer";
import { DollarSign, Plus, CheckCircle2, TrendingUp, AlertCircle, FolderGit2, Handshake, ChevronRight } from "lucide-react";
import { industryService } from "../../services/industryService";
import { IndustryFunding as IndustryFundingType, IndustryPartnership } from "../../types";
import { LoadingState } from "../../components/common/LoadingState";

export default function IndustryFunding() {
  const [fundingList, setFundingList] = useState<IndustryFundingType[]>([]);
  const [partnerships, setPartnerships] = useState<IndustryPartnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const parts = await industryService.getMyPartnerships({ status: "accepted" });
      setPartnerships(parts || []);

      if (parts && parts.length > 0) {
        const fundingPromises = parts.map((p) =>
          industryService.getProjectFunding(p.project_id).catch(() => [])
        );
        const results = await Promise.all(fundingPromises);
        const allFunding = results.flat();
        setFundingList(allFunding);
      } else {
        setFundingList([]);
      }
    } catch (err: any) {
      console.error("Failed to load funding proposals:", err);
      setError(err?.message || "Failed to load corporate funding records.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalCommitted = fundingList
    .filter((f) => f.status === "approved" || f.status === "disbursed")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalProposed = fundingList.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <DashboardHeader
        badge="Capital Grants & Sponsorship"
        badgeColor="#F59E0B"
        title="Corporate Funding & Sponsorship Registry"
        subtitle="Manage formal research grants, student prototype sponsorships, and CSR capital proposals submitted to university teams."
      >
        <div className="flex items-center gap-2">
          <Link
            to="/industry/partnerships"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 transition-colors border border-amber-200"
          >
            <Handshake size={14} /> My Partnerships
          </Link>
          <Link
            to="/industry/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
          >
            <FolderGit2 size={14} /> Discover Projects
          </Link>
        </div>
      </DashboardHeader>

      <PageContainer>
        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Total Proposals
            </span>
            <span className="text-2xl font-black text-gray-900">{fundingList.length}</span>
            <p className="text-[11px] text-gray-400 mt-1">Across all accepted partnerships</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Total Capital Proposed
            </span>
            <span className="text-2xl font-black text-amber-600">
              INR {totalProposed.toLocaleString()}
            </span>
            <p className="text-[11px] text-gray-400 mt-1">Active grant & sponsorship proposals</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-xs">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Approved / Committed
            </span>
            <span className="text-2xl font-black text-emerald-600">
              INR {totalCommitted.toLocaleString()}
            </span>
            <p className="text-[11px] text-gray-400 mt-1">Cleared by university project teams</p>
          </div>
        </div>

        {loading ? (
          <LoadingState message="Loading funding records from MongoDB..." />
        ) : error ? (
          <div className="bg-white border border-rose-200 rounded-3xl p-10 text-center space-y-3">
            <AlertCircle size={32} className="text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-gray-900">Failed to load funding records</h3>
            <p className="text-xs text-gray-500">{error}</p>
            <button
              onClick={loadData}
              className="px-4 py-2 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              Retry
            </button>
          </div>
        ) : fundingList.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
              <DollarSign size={28} />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Corporate Funding Proposals Yet</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              {"Funding proposals are submitted directly to accepted university partnerships. Once an expression of interest is accepted, you can propose grants, sponsorships, and CSR capital from the project collaboration workspace."}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                to="/industry/partnerships"
                className="px-4 py-2 rounded-xl text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
              >
                View Accepted Partnerships
              </Link>
              <Link
                to="/industry/projects"
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-xs"
              >
                Discover University Projects
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {fundingList.map((f) => {
              const statusColors: Record<string, string> = {
                proposed: "bg-amber-50 text-amber-700 border-amber-200",
                approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
                rejected: "bg-rose-50 text-rose-700 border-rose-200",
                withdrawn: "bg-gray-100 text-gray-500 border-gray-200",
                disbursed: "bg-purple-50 text-purple-700 border-purple-200",
              };

              return (
                <div
                  key={f.id}
                  className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-100">
                        {f.funding_type.replace("_", " ")}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                          statusColors[f.status] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}
                      >
                        {f.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-gray-900">{f.title}</h4>
                    <p className="text-xs text-gray-600 max-w-xl">{f.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                      <span>Proposed: {new Date(f.proposed_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(f.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        Amount
                      </span>
                      <span className="text-2xl font-black text-purple-700">
                        {f.currency} {f.amount.toLocaleString()}
                      </span>
                    </div>
                    <Link
                      to={`/industry/projects/${f.project_id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors"
                    >
                      <span>Open Project Workspace</span>
                      <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
