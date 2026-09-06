import { api } from "./api";
import {
  IndustryProfile,
  IndustryProfileCreateInput,
  IndustryProfileUpdateInput,
  IndustryPartnerItem,
  IndustryDiscoveredProjectsPage,
  IndustryDiscoveredProjectDetail,
  IndustryPartnership,
  IndustryExpert,
  IndustryExpertCreateInput,
  IndustryExpertUpdateInput,
  ProjectMentorship,
  ProjectMentorshipCreateInput,
  ProjectMentorshipUpdateInput,
  IndustryDashboardMetrics,
  IndustryResource,
  IndustryResourceCreateInput,
  IndustryResourceUpdateInput,
  IndustryFunding,
  IndustryFundingCreateInput,
  IndustryFundingUpdateInput,
  IndustryCollaborationSummary,
} from "../types";

export const industryService = {
  /**
   * Fetch authenticated industry profile from MongoDB.
   * Returns null if profile is not created yet (404).
   */
  async getProfile(): Promise<IndustryProfile | null> {
    try {
      return await api.get<IndustryProfile>("/api/industries/profile");
    } catch (err: any) {
      if (err?.status === 404) {
        return null;
      }
      throw err;
    }
  },

  /**
   * Create new industry profile in MongoDB.
   */
  async createProfile(data: IndustryProfileCreateInput): Promise<IndustryProfile> {
    return await api.post<IndustryProfile>("/api/industries/profile", data);
  },

  /**
   * Surgically update existing industry profile in MongoDB.
   */
  async updateProfile(data: IndustryProfileUpdateInput): Promise<IndustryProfile> {
    return await api.put<IndustryProfile>("/api/industries/profile", data);
  },

  /**
   * Discover real university projects eligible for industry collaboration.
   * Supports search, category, status, university filtering, and pagination.
   */
  async discoverProjects(params?: {
    search?: string;
    category?: string;
    status?: string;
    university?: string;
    page?: number;
    limit?: number;
  }): Promise<IndustryDiscoveredProjectsPage> {
    const queryParams: Record<string, any> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.category && params.category !== "all") queryParams.category = params.category;
    if (params?.status && params.status !== "all") queryParams.status = params.status;
    if (params?.university && params.university !== "all") queryParams.university = params.university;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;

    return await api.get<IndustryDiscoveredProjectsPage>("/api/industries/projects", {
      params: queryParams,
    });
  },

  /**
   * Get sanitized project details for external industry discovery.
   */
  async getDiscoveredProjectDetail(projectId: string): Promise<IndustryDiscoveredProjectDetail> {
    return await api.get<IndustryDiscoveredProjectDetail>(`/api/industries/projects/${projectId}`);
  },

  // =========================================================================
  // 7C: INDUSTRY PARTNERSHIPS
  // =========================================================================

  /**
   * Submit an expression of partnership interest for a university project.
   */
  async expressPartnershipInterest(projectId: string, message?: string): Promise<IndustryPartnership> {
    return await api.post<IndustryPartnership>(`/api/industries/projects/${projectId}/interest`, {
      message: message?.trim() || undefined,
    });
  },

  /**
   * Get existing partnership interest status for a project.
   */
  async getProjectInterest(projectId: string): Promise<IndustryPartnership | null> {
    try {
      return await api.get<IndustryPartnership | null>(`/api/industries/projects/${projectId}/interest`);
    } catch (err: any) {
      if (err?.status === 404) return null;
      throw err;
    }
  },

  /**
   * List all partnerships submitted by authenticated industry partner.
   */
  async getMyPartnerships(params?: { status?: string; search?: string }): Promise<IndustryPartnership[]> {
    const queryParams: Record<string, any> = {};
    if (params?.status && params.status !== "all") queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;
    return await api.get<IndustryPartnership[]>("/api/industries/partnerships", {
      params: queryParams,
    });
  },

  /**
   * Withdraw a pending partnership request.
   */
  async withdrawPartnership(partnershipId: string): Promise<IndustryPartnership> {
    return await api.put<IndustryPartnership>(`/api/industries/partnerships/${partnershipId}/withdraw`);
  },

  // =========================================================================
  // 7D: INDUSTRY EXPERTS
  // =========================================================================

  /**
   * List experts belonging strictly to the authenticated corporate account.
   */
  async getExperts(params?: {
    search?: string;
    expertise?: string;
    skills?: string;
    availability?: string;
  }): Promise<IndustryExpert[]> {
    const queryParams: Record<string, any> = {};
    if (params?.search) queryParams.search = params.search;
    if (params?.expertise && params.expertise !== "all") queryParams.expertise = params.expertise;
    if (params?.skills && params.skills !== "all") queryParams.skills = params.skills;
    if (params?.availability && params.availability !== "all") queryParams.availability = params.availability;

    return await api.get<IndustryExpert[]>("/api/industries/experts", {
      params: queryParams,
    });
  },

  async getExpertById(expertId: string): Promise<IndustryExpert> {
    return await api.get<IndustryExpert>(`/api/industries/experts/${expertId}`);
  },

  async createExpert(data: IndustryExpertCreateInput): Promise<IndustryExpert> {
    return await api.post<IndustryExpert>("/api/industries/experts", data);
  },

  async updateExpert(expertId: string, data: IndustryExpertUpdateInput): Promise<IndustryExpert> {
    return await api.put<IndustryExpert>(`/api/industries/experts/${expertId}`, data);
  },

  async deleteExpert(expertId: string): Promise<void> {
    await api.delete(`/api/industries/experts/${expertId}`);
  },

  // =========================================================================
  // 7D: PROJECT MENTORSHIP
  // =========================================================================

  /**
   * Propose an industry expert as a technical mentor for an accepted partnership.
   */
  async proposeMentorship(projectId: string, data: ProjectMentorshipCreateInput): Promise<ProjectMentorship> {
    return await api.post<ProjectMentorship>(`/api/industries/projects/${projectId}/mentorships`, data);
  },

  /**
   * Get all mentorships on a project for authenticated industry partner.
   */
  async getProjectMentorships(projectId: string): Promise<ProjectMentorship[]> {
    return await api.get<ProjectMentorship[]>(`/api/industries/projects/${projectId}/mentorships`);
  },

  /**
   * Get all mentorship engagements across projects.
   */
  async getAllMentorships(): Promise<ProjectMentorship[]> {
    return await api.get<ProjectMentorship[]>("/api/industries/mentorships");
  },

  /**
   * Update status or objectives of a mentorship.
   */
  async updateMentorship(mentorshipId: string, data: ProjectMentorshipUpdateInput): Promise<ProjectMentorship> {
    return await api.put<ProjectMentorship>(`/api/industries/mentorships/${mentorshipId}`, data);
  },

  /**
   * Withdraw a mentorship engagement.
   */
  async withdrawMentorship(mentorshipId: string): Promise<void> {
    await api.delete(`/api/industries/mentorships/${mentorshipId}`);
  },

  /**
   * Real Industry Dashboard summary statistics.
   */
  async getDashboardMetrics(): Promise<IndustryDashboardMetrics> {
    return await api.get<IndustryDashboardMetrics>("/api/industries/dashboard/metrics");
  },

  // =========================================================================
  // RESOURCES & TECHNOLOGY SUPPORT
  // =========================================================================

  /**
   * Propose a resource or technology contribution for a university project.
   */
  async createResource(projectId: string, data: IndustryResourceCreateInput): Promise<IndustryResource> {
    return await api.post<IndustryResource>(`/api/industries/projects/${projectId}/resources`, data);
  },

  /**
   * Get all resource contributions proposed by this partner for a project.
   */
  async getProjectResources(projectId: string): Promise<IndustryResource[]> {
    return await api.get<IndustryResource[]>(`/api/industries/projects/${projectId}/resources`);
  },

  /**
   * Update a resource contribution (e.g. mark provided or edit description).
   */
  async updateResource(resourceId: string, data: IndustryResourceUpdateInput): Promise<IndustryResource> {
    return await api.put<IndustryResource>(`/api/industries/resources/${resourceId}`, data);
  },

  /**
   * Withdraw a resource contribution proposal.
   */
  async withdrawResource(resourceId: string): Promise<void> {
    await api.delete(`/api/industries/resources/${resourceId}`);
  },

  // =========================================================================
  // FUNDING & SPONSORSHIP PROPOSALS
  // =========================================================================

  /**
   * Submit a funding or sponsorship proposal for a project.
   */
  async createFundingProposal(projectId: string, data: IndustryFundingCreateInput): Promise<IndustryFunding> {
    return await api.post<IndustryFunding>(`/api/industries/projects/${projectId}/funding`, data);
  },

  /**
   * Get funding proposals submitted by this partner for a project.
   */
  async getProjectFunding(projectId: string): Promise<IndustryFunding[]> {
    return await api.get<IndustryFunding[]>(`/api/industries/projects/${projectId}/funding`);
  },

  /**
   * Update or modify a funding proposal.
   */
  async updateFundingProposal(fundingId: string, data: IndustryFundingUpdateInput): Promise<IndustryFunding> {
    return await api.put<IndustryFunding>(`/api/industries/funding/${fundingId}`, data);
  },

  /**
   * Withdraw a funding proposal.
   */
  async withdrawFundingProposal(fundingId: string): Promise<void> {
    await api.delete(`/api/industries/funding/${fundingId}`);
  },

  // =========================================================================
  // COLLABORATION SUMMARY
  // =========================================================================

  /**
   * Fetch integrated collaboration summary for a project workspace.
   */
  async getCollaborationSummary(projectId: string): Promise<IndustryCollaborationSummary> {
    return await api.get<IndustryCollaborationSummary>(`/api/industries/projects/${projectId}/collaboration-summary`);
  },

  /**
   * Legacy / Government directory access
   */
  async getPartners(): Promise<IndustryPartnerItem[]> {
    return [];
  },

  async getPartnerById(id: string): Promise<IndustryPartnerItem | null> {
    return null;
  },
};

