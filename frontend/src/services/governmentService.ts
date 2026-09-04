import { nationalImpactStats, categoryBreakdown, monthlyTrends } from "../data/mock/impactMetrics";

export const governmentService = {
  async getOverviewMetrics() {
    await new Promise((r) => setTimeout(r, 200));
    return {
      stats: nationalImpactStats,
      categories: categoryBreakdown,
      trends: monthlyTrends,
    };
  },
};
