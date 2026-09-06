import { api } from "./api";
import {
  GovernmentChallengeDetail,
  GovernmentChallengeReview,
  GovernmentChallengeReviewCreateInput,
  GovernmentChallengeReviewUpdateInput,
  GovernmentChallengesPage,
  GovernmentDashboardMetrics,
  GovernmentProfile,
  GovernmentProfileCreateInput,
  GovernmentProfileUpdateInput,
  PlatformActivityItem,
} from "../types";

export const governmentService = {
  /**
   * Retrieve official government profile for the authenticated government user.
   */
  async getProfile(): Promise<GovernmentProfile | null> {
    try {
      return await api.get<GovernmentProfile>("/api/government/profile");
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Create government profile for the authenticated government user.
   */
  async createProfile(data: GovernmentProfileCreateInput): Promise<GovernmentProfile> {
    return await api.post<GovernmentProfile>("/api/government/profile", data);
  },

  /**
   * Update existing government profile.
   */
  async updateProfile(data: GovernmentProfileUpdateInput): Promise<GovernmentProfile> {
    return await api.put<GovernmentProfile>("/api/government/profile", data);
  },

  /**
   * Aggregate real platform metrics from MongoDB collections.
   */
  async getDashboardMetrics(): Promise<GovernmentDashboardMetrics> {
    return await api.get<GovernmentDashboardMetrics>("/api/government/dashboard/metrics");
  },

  /**
   * Retrieve live platform audit activity log.
   */
  async getRecentActivity(): Promise<PlatformActivityItem[]> {
    return await api.get<PlatformActivityItem[]>("/api/government/dashboard/activity");
  },

  // ==========================================================================
  // Step 8B: Challenge Monitoring & Review APIs
  // ==========================================================================

  /**
   * Retrieve paginated challenges with optional filtering for Government oversight.
   */
  async getChallenges(params?: {
    search?: string;
    category?: string;
    priority_level?: string;
    government_review_status?: string;
    ai_status?: string;
    duplicate_status?: string;
    challenge_status?: string;
    state?: string;
    district?: string;
    page?: number;
    limit?: number;
  }): Promise<GovernmentChallengesPage> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    const endpoint = `/api/government/challenges${qStr ? `?${qStr}` : ""}`;
    return await api.get<GovernmentChallengesPage>(endpoint);
  },

  /**
   * Retrieve full challenge details including AI analysis, duplicates, priority,
   * university project linkage, and government review.
   */
  async getChallengeDetail(challengeId: string): Promise<GovernmentChallengeDetail> {
    return await api.get<GovernmentChallengeDetail>(`/api/government/challenges/${challengeId}`);
  },

  /**
   * Retrieve current authenticated officer's review for a challenge.
   */
  async getChallengeReview(challengeId: string): Promise<GovernmentChallengeReview | null> {
    try {
      return await api.get<GovernmentChallengeReview>(`/api/government/challenges/${challengeId}/review`);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Submit an official Government validation decision for a challenge.
   */
  async createChallengeReview(
    challengeId: string,
    data: GovernmentChallengeReviewCreateInput,
  ): Promise<GovernmentChallengeReview> {
    return await api.post<GovernmentChallengeReview>(`/api/government/challenges/${challengeId}/review`, data);
  },

  /**
   * Update the authenticated government official's review.
   */
  async updateChallengeReview(
    challengeId: string,
    data: GovernmentChallengeReviewUpdateInput,
  ): Promise<GovernmentChallengeReview> {
    return await api.put<GovernmentChallengeReview>(`/api/government/challenges/${challengeId}/review`, data);
  },
};

