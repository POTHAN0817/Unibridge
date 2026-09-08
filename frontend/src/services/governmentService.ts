import { api } from "./api";
import {
  GovernmentAction,
  GovernmentActionCreateInput,
  GovernmentActionsPage,
  GovernmentActionUpdateInput,
  GovernmentAnalyticsResponse,
  GovernmentChallengeDetail,
  GovernmentChallengeReview,
  GovernmentChallengeReviewCreateInput,
  GovernmentChallengeReviewUpdateInput,
  GovernmentChallengesPage,
  GovernmentCollaborationDetail,
  GovernmentCollaborationsPage,
  GovernmentDashboardMetrics,
  GovernmentDashboardPriorities,
  GovernmentDeploymentsPage,
  GovernmentLifecycleMonitoringSummary,
  GovernmentPilotsPage,
  GovernmentProfile,
  GovernmentProfileCreateInput,
  GovernmentProfileUpdateInput,
  GovernmentProjectDossier,
  GovernmentProjectsPage,
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

  /**
   * Retrieve prioritized items requiring Government attention across challenges, actions, and pilots.
   */
  async getDashboardPriorities(): Promise<GovernmentDashboardPriorities> {
    return await api.get<GovernmentDashboardPriorities>("/api/government/dashboard/priorities");
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

  // ==========================================================================
  // Step 8C: University Project Monitoring APIs
  // ==========================================================================

  /**
   * Retrieve paginated university projects with real server-side filters.
   */
  async getProjects(params?: {
    search?: string;
    category?: string;
    project_status?: string;
    lifecycle_stage?: string;
    university?: string;
    challenge?: string;
    state?: string;
    district?: string;
    page?: number;
    limit?: number;
  }): Promise<GovernmentProjectsPage> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    const endpoint = `/api/government/projects${qStr ? `?${qStr}` : ""}`;
    return await api.get<GovernmentProjectsPage>(endpoint);
  },

  /**
   * Retrieve complete read-only administrative project dossier.
   */
  async getProjectDossier(projectId: string): Promise<GovernmentProjectDossier> {
    return await api.get<GovernmentProjectDossier>(`/api/government/projects/${projectId}`);
  },

  // ==========================================================================
  // Step 8D: Industry Collaboration Monitoring APIs
  // ==========================================================================

  /**
   * Retrieve paginated industry-university partnerships.
   */
  async getCollaborations(params?: {
    search?: string;
    status?: string;
    university?: string;
    industry?: string;
    project?: string;
    category?: string;
    collaboration_type?: string;
    page?: number;
    limit?: number;
  }): Promise<GovernmentCollaborationsPage> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    const endpoint = `/api/government/collaborations${qStr ? `?${qStr}` : ""}`;
    return await api.get<GovernmentCollaborationsPage>(endpoint);
  },

  /**
   * Retrieve complete read-only industry partnership detail.
   */
  async getCollaborationDetail(partnershipId: string): Promise<GovernmentCollaborationDetail> {
    return await api.get<GovernmentCollaborationDetail>(`/api/government/collaborations/${partnershipId}`);
  },

  // ==========================================================================
  // Step 8E: Pilot & Deployment Oversight APIs
  // ==========================================================================

  /**
   * Return real project lifecycle monitoring summaries across all stages.
   */
  async getMonitoringSummary(): Promise<GovernmentLifecycleMonitoringSummary> {
    return await api.get<GovernmentLifecycleMonitoringSummary>("/api/government/monitoring");
  },

  /**
   * Retrieve paginated engineering pilot records from project_pilots.
   */
  async getPilots(params?: {
    project?: string;
    university?: string;
    status?: string;
    category?: string;
    state?: string;
    district?: string;
    page?: number;
    limit?: number;
  }): Promise<GovernmentPilotsPage> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    const endpoint = `/api/government/pilots${qStr ? `?${qStr}` : ""}`;
    return await api.get<GovernmentPilotsPage>(endpoint);
  },

  /**
   * Retrieve paginated deployment readiness and deployment records.
   */
  async getDeployments(params?: {
    status?: string;
    university?: string;
    page?: number;
    limit?: number;
  }): Promise<GovernmentDeploymentsPage> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    const endpoint = `/api/government/deployments${qStr ? `?${qStr}` : ""}`;
    return await api.get<GovernmentDeploymentsPage>(endpoint);
  },

  // ==========================================================================
  // Step 8F: Regional & Category Analytics APIs
  // ==========================================================================

  /**
   * Retrieve real administrative analytics aggregated from MongoDB.
   */
  async getAnalytics(): Promise<GovernmentAnalyticsResponse> {
    return await api.get<GovernmentAnalyticsResponse>("/api/government/analytics");
  },

  // ==========================================================================
  // Step 8G: Government Actions & Decisions APIs
  // ==========================================================================

  /**
   * Retrieve paginated actions created by the authenticated government official.
   */
  async getActions(params?: {
    status?: string;
    priority?: string;
    action_type?: string;
    target_type?: string;
    page?: number;
    limit?: number;
  }): Promise<GovernmentActionsPage> {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "" && val !== "all") {
          query.append(key, String(val));
        }
      });
    }
    const qStr = query.toString();
    const endpoint = `/api/government/actions${qStr ? `?${qStr}` : ""}`;
    return await api.get<GovernmentActionsPage>(endpoint);
  },

  /**
   * Retrieve single action details.
   */
  async getActionDetail(actionId: string): Promise<GovernmentAction> {
    return await api.get<GovernmentAction>(`/api/government/actions/${actionId}`);
  },

  /**
   * Create a new Government administrative action.
   */
  async createAction(data: GovernmentActionCreateInput): Promise<GovernmentAction> {
    return await api.post<GovernmentAction>("/api/government/actions", data);
  },

  /**
   * Update an existing Government action.
   */
  async updateAction(actionId: string, data: GovernmentActionUpdateInput): Promise<GovernmentAction> {
    return await api.put<GovernmentAction>(`/api/government/actions/${actionId}`, data);
  },

  /**
   * Delete a Government action.
   */
  async deleteAction(actionId: string): Promise<{ detail: string }> {
    return await api.delete<{ detail: string }>(`/api/government/actions/${actionId}`);
  },
};


