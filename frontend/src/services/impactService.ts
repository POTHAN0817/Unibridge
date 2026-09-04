import { mockImpactStories, nationalImpactStats, categoryBreakdown, monthlyTrends } from "../data/mock/impactMetrics";
import { ImpactStory } from "../types";

export const impactService = {
  async getStories(): Promise<ImpactStory[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...mockImpactStories];
  },

  async getNationalStats() {
    await new Promise((r) => setTimeout(r, 150));
    return {
      stats: nationalImpactStats,
      categories: categoryBreakdown,
      trends: monthlyTrends,
    };
  },
};
