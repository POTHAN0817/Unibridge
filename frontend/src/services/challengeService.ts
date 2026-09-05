import { api } from "./api";
import { mockChallenges } from "../data/mock/challenges";
import { Challenge, ChallengeImage, ChallengeStatus, PriorityLevel } from "../types";

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
  image?: ChallengeImage | null;
  affected_people?: number | null;
  urgency?: string | null;
  citizen_tags?: string[] | null;
  ai_analysis?: Record<string, any> | null;
  duplicate_analysis?: any | null;
  priority_analysis?: any | null;
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
  photo?: File | null;
  affected_people?: number | null;
  urgency?: string | null;
  citizen_tags?: string[] | null;
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

  // Derive priority level from priority_analysis level or priority_score
  let derivedPriority: PriorityLevel = "MEDIUM";
  const pLevel = b.priority_analysis?.level?.toUpperCase();
  if (pLevel === "HIGH" || pLevel === "CRITICAL") derivedPriority = "HIGH";
  else if (pLevel === "LOW") derivedPriority = "LOW";
  else if (pLevel === "MEDIUM") derivedPriority = "MEDIUM";

  // Real affected people display text
  const affectedText = b.affected_people !== undefined && b.affected_people !== null
    ? `${b.affected_people.toLocaleString()} citizens affected`
    : "Local Community";

  // Real tags combination
  const combinedTags: string[] = [];
  if (b.category) combinedTags.push(b.category);
  if (b.subcategory) combinedTags.push(b.subcategory);
  if (Array.isArray(b.citizen_tags)) {
    b.citizen_tags.forEach((t) => {
      if (t && !combinedTags.includes(t)) combinedTags.push(t);
    });
  }
  if (combinedTags.length === 0) combinedTags.push("Civic Issue");

  return {
    id: b.id,
    title: b.title,
    description: b.description,
    category: b.category || "General",
    subcategory: b.subcategory || undefined,
    location: locationStr,
    state: loc?.state || "",
    district: loc?.district || "",
    status: statusFormatted,
    priority: derivedPriority,
    priorityScore: b.priority_score ?? b.priority_analysis?.score ?? 0,
    similarReports: b.duplicate_analysis?.duplicate_count ?? 0,
    assignedUniversity: null,
    assignedProjectId: null,
    progress: statusFormatted === "Submitted" ? 15 : 30,
    stage: statusFormatted === "Submitted" ? "Submitted" : statusFormatted,
    tags: combinedTags,
    affectedPeople: affectedText,
    affected_people: b.affected_people,
    urgency: b.urgency || b.priority_analysis?.level || undefined,
    citizen_tags: b.citizen_tags || [],
    submittedBy: "Citizen",
    submittedDate: createdDate,
    image: b.image || null,
    aiCategoryConfidence: b.ai_analysis?.confidence,
    aiSummary: b.ai_analysis?.summary,
    requiredExpertise: b.ai_analysis?.keywords || [],
    ai_analysis: b.ai_analysis,
    duplicate_analysis: b.duplicate_analysis,
    priority_analysis: b.priority_analysis,
    timeline: [
      {
        event: "Challenge successfully submitted to UniBridge",
        time: createdDate,
        type: "neutral",
      },
      ...(b.ai_analysis
        ? [
            {
              event: `AI Problem Analysis completed (${b.category || "General"})`,
              time: createdDate,
              type: "ai" as const,
            },
          ]
        : []),
      ...(b.priority_analysis
        ? [
            {
              event: `Priority computed: ${b.priority_analysis.score}/100 (${b.priority_analysis.level.toUpperCase()})`,
              time: createdDate,
              type: "info" as const,
            },
          ]
        : []),
      ...(b.duplicate_analysis?.is_duplicate
        ? [
            {
              event: `Identified ${b.duplicate_analysis.duplicate_count} semantically similar community report(s)`,
              time: createdDate,
              type: "warning" as const,
            },
          ]
        : []),
    ],
  };
}

let challengesState: Challenge[] = [...mockChallenges];

export const challengeService = {
  /**
   * Submit a new challenge to the FastAPI backend and store in MongoDB Atlas.
   * Sends multipart/form-data to support optional photo upload.
   */
  async createChallenge(input: CreateChallengeInput | (Partial<Challenge> & { photo?: File | null })): Promise<Challenge> {
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
    const photo = (input as any).photo || null;

    const affectedPeople = (input as any).affected_people !== undefined
      ? (input as any).affected_people
      : (input as any).affectedPeople;
    const urgency = (input as any).urgency || null;
    const citizenTags = (input as any).citizen_tags || (input as any).tags || null;

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    if (category) formData.append("category", category);
    if (subcategory) formData.append("subcategory", subcategory);
    if (district) formData.append("district", district);
    if (state) formData.append("state", state);
    if (address) formData.append("address", address);
    if (latitude !== null && latitude !== undefined) formData.append("latitude", String(latitude));
    if (longitude !== null && longitude !== undefined) formData.append("longitude", String(longitude));
    if (photo instanceof File) {
      formData.append("photo", photo);
    }
    if (affectedPeople !== undefined && affectedPeople !== null && String(affectedPeople).trim() !== "") {
      formData.append("affected_people", String(affectedPeople));
    }
    if (urgency) {
      formData.append("urgency", String(urgency));
    }
    if (citizenTags) {
      formData.append("citizen_tags", Array.isArray(citizenTags) ? JSON.stringify(citizenTags) : String(citizenTags));
    }

    const response = await api.post<BackendChallenge>("/api/challenges", formData);
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
      // Return null if not found in backend rather than presenting fake mock challenge
      return null;
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
