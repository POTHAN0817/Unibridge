import { api } from "./api";
import { mockChallenges } from "../data/mock/challenges";
import { Challenge, ChallengeStatus, PriorityLevel } from "../types";

export interface BackendChallengeLocation {
  district?: string | null;
  state?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  address?: string | null;
}

export interface BackendChallenge {
  id: string;
  title: string;
  description: string;
  category: string | null;
  subcategory: string | null;
  location: BackendChallengeLocation | null;
  reported_by: string;
  status: string;
  created_at: string;
  updated_at: string;
  ai_analysis?: Record<string, any> | null;
  priority_score?: number | null;
  duplicate_of?: string | null;
  matched_universities?: string[] | null;
  required_skills?: string[] | null;
  validation?: Record<string, any> | null;
  project?: Record<string, any> | null;
  impact?: Record<string, any> | null;
}

export interface CreateChallengeInput {
  title: string;
  description: string;
  category?: string | null;
  subcategory?: string | null;
  location?: BackendChallengeLocation | null;
}

export function mapBackendChallengeToFrontend(b: BackendChallenge): Challenge {
  const loc = b.location;
  const locParts = [loc?.address, loc?.district, loc?.state].filter(Boolean);
  const locationStr = locParts.length > 0 ? locParts.join(", ") : "Not specified";

  let statusFormatted: ChallengeStatus = "Submitted";
  if (b.status) {
    const s = b.status.toLowerCase();
    if (s === "submitted") statusFormatted = "Submitted";
    else if (s === "ai_processed" || s === "ai analyzed") statusFormatted = "AI Analyzed";
    else if (s === "validated") statusFormatted = "Validated";
    else if (s === "university_assigned" || s === "assigned") statusFormatted = "Assigned";
    else if (s === "in progress" || s === "in_progress") statusFormatted = "In Progress";
    else if (s === "testing" || s === "pilot") statusFormatted = "Testing";
    else if (s === "resolved" || s === "deployed") statusFormatted = "Resolved";
  }

  const createdDate = b.created_at
    ? new Date(b.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  return {
    id: b.id,
    title: b.title,
    description: b.description,
    category: b.category || "General",
    location: locationStr,
    state: loc?.state || "",
    district: loc?.district || "",
    status: statusFormatted,
    priority: "MEDIUM" as PriorityLevel,
    priorityScore: b.priority_score ?? 0,
    similarReports: 0,
    assignedUniversity: null,
    assignedProjectId: null,
    progress: statusFormatted === "Submitted" ? 15 : 30,
    stage: statusFormatted === "Submitted" ? "Submitted" : statusFormatted,
    tags: [b.category || "Civic Issue"].filter(Boolean),
    affectedPeople: "Local Community",
    submittedBy: "Citizen",
    submittedDate: createdDate,
    timeline: [
      {
        event: "Challenge successfully submitted to UniBridge",
        time: createdDate,
        type: "neutral",
      },
    ],
  };
}

let challengesState: Challenge[] = [...mockChallenges];

export const challengeService = {
  /**
   * Submit a new challenge to the FastAPI backend and store in MongoDB Atlas.
   */
  async createChallenge(input: CreateChallengeInput | Partial<Challenge>): Promise<Challenge> {
    const title = input.title || "";
    const description = input.description || "";
    const category = input.category || null;
    const subcategory = (input as any).subcategory || null;

    const locInput = (input as CreateChallengeInput).location;
    const district = locInput?.district || (input as any).district || null;
    const state = locInput?.state || (input as any).state || null;
    const address = locInput?.address || (input as any).village || (input as any).location || null;
    const latitude = locInput?.latitude || (input as any).latitude || null;
    const longitude = locInput?.longitude || (input as any).longitude || null;

    const payload = {
      title,
      description,
      category,
      subcategory,
      location: {
        district,
        state,
        latitude,
        longitude,
        address,
      },
    };

    const response = await api.post<BackendChallenge>("/api/challenges", payload);
    const mapped = mapBackendChallengeToFrontend(response);

    // Keep in local cache for immediate UI responsiveness
    challengesState = [mapped, ...challengesState];
    return mapped;
  },

  /**
   * Fetch only the challenges submitted by the currently logged-in citizen.
   */
  async getMyChallenges(): Promise<Challenge[]> {
    const response = await api.get<BackendChallenge[]>("/api/challenges/my");
    return response.map(mapBackendChallengeToFrontend);
  },

  /**
   * Fetch a specific challenge by its ID.
   */
  async getChallengeById(id: string): Promise<Challenge | null> {
    try {
      const response = await api.get<BackendChallenge>(`/api/challenges/${id}`);
      return mapBackendChallengeToFrontend(response);
    } catch {
      // Fallback to local/mock challenges if viewing legacy mock item
      return challengesState.find((c) => c.id === id) || null;
    }
  },

  /**
   * Preserved for role-based mock screens until those are connected to real backend APIs.
   */
  async getAllChallenges(): Promise<Challenge[]> {
    return [...challengesState];
  },

  async getChallengesByRole(role: string): Promise<Challenge[]> {
    if (role === "citizen") {
      try {
        return await this.getMyChallenges();
      } catch {
        return challengesState;
      }
    }
    if (role === "university") {
      return challengesState.filter((c) => c.status !== "Submitted");
    }
    return challengesState;
  },

  async validateChallenge(id: string, decision: "APPROVE" | "REJECT", priorityScore?: number): Promise<Challenge | null> {
    const index = challengesState.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updated = {
      ...challengesState[index],
      status: decision === "APPROVE" ? ("Validated" as const) : ("Submitted" as const),
      priorityScore: priorityScore ?? challengesState[index].priorityScore,
      stage: decision === "APPROVE" ? "University Matching" : "Under Review",
    };
    challengesState[index] = updated;
    return updated;
  },
};
