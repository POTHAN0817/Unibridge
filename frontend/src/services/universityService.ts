import { api } from "./api";
import {
  UniversityProfile,
  UniversityMatchesResult,
  Challenge,
} from "../types";
import { mapBackendChallengeToFrontend, BackendChallenge } from "./challengeService";

export const universityService = {
  /**
   * Fetch authenticated university profile from MongoDB.
   */
  async getMyProfile(): Promise<UniversityProfile | null> {
    try {
      return await api.get<UniversityProfile>("/api/universities/profile");
    } catch {
      return null;
    }
  },

  /**
   * Create or update authenticated university profile in MongoDB.
   */
  async saveProfile(profile: Partial<UniversityProfile>): Promise<UniversityProfile> {
    return await api.post<UniversityProfile>("/api/universities/profile", profile);
  },

  /**
   * Fetch public university details by ID.
   */
  async getUniversityById(id: string): Promise<UniversityProfile | null> {
    try {
      return await api.get<UniversityProfile>(`/api/universities/${id}`);
    } catch {
      return null;
    }
  },

  /**
   * Fetch all universities.
   */
  async getUniversities(): Promise<any[]> {
    try {
      return await api.get<any[]>("/api/universities");
    } catch {
      return [];
    }
  },

  /**
   * Fetch real challenges matching the authenticated university's capabilities.
   */
  async getMatchedChallenges(): Promise<
    Array<{
      challenge: Challenge;
      matchEvaluation: any;
    }>
  > {
    try {
      const response = await api.get<
        Array<{
          challenge_id: string;
          title: string;
          description: string;
          category: string;
          location?: any;
          status: string;
          priority_score?: number;
          match_evaluation: any;
        }>
      >("/api/universities/challenges/matches");

      return response.map((item) => ({
        challenge: {
          id: item.challenge_id,
          title: item.title,
          description: item.description,
          category: item.category || "General",
          location: typeof item.location === "object" && item.location
            ? [item.location.address, item.location.district, item.location.state].filter(Boolean).join(", ")
            : "Location not specified",
          state: item.location?.state || "",
          district: item.location?.district || "",
          status: (item.status as any) || "Submitted",
          priority: item.priority_score && item.priority_score >= 70 ? "HIGH" : "MEDIUM",
          priorityScore: item.priority_score || item.match_evaluation?.score || 0,
          similarReports: 0,
          progress: 25,
          stage: "Matching",
          tags: [item.category || "Academic"].filter(Boolean),
          affectedPeople: "Local Community",
          submittedBy: "Citizen",
          submittedDate: "Active",
        },
        matchEvaluation: item.match_evaluation,
      }));
    } catch {
      return [];
    }
  },

  /**
   * Retrieve calculated real university matches for a specific challenge.
   */
  async getChallengeUniversityMatches(challengeId: string): Promise<UniversityMatchesResult> {
    try {
      return await api.get<UniversityMatchesResult>(`/api/challenges/${challengeId}/university-matches`);
    } catch {
      return {
        status: "no_candidates",
        matches: [],
        model_version: "unibridge-university-match-v1",
      };
    }
  },
};
