import { mockChallenges } from "../data/mock/challenges";
import { Challenge } from "../types";

let challengesState: Challenge[] = [...mockChallenges];

export const challengeService = {
  async getAllChallenges(): Promise<Challenge[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...challengesState];
  },

  async getChallengeById(id: string): Promise<Challenge | null> {
    await new Promise((r) => setTimeout(r, 150));
    return challengesState.find((c) => c.id === id) || null;
  },

  async getChallengesByRole(role: string): Promise<Challenge[]> {
    await new Promise((r) => setTimeout(r, 200));
    if (role === "citizen") {
      return challengesState;
    }
    if (role === "university") {
      return challengesState.filter((c) => c.status !== "Submitted");
    }
    return challengesState;
  },

  async createChallenge(challengeData: Partial<Challenge>): Promise<Challenge> {
    await new Promise((r) => setTimeout(r, 300));
    const newChallenge: Challenge = {
      id: `CF-2026-${Math.floor(100 + Math.random() * 900)}`,
      title: challengeData.title || "Untitled Challenge",
      description: challengeData.description || "",
      category: challengeData.category || "General",
      location: challengeData.location || "Tamil Nadu",
      state: challengeData.state || "Tamil Nadu",
      district: challengeData.district || "Virudhunagar",
      status: "Submitted",
      priority: challengeData.priority || "MEDIUM",
      priorityScore: Math.floor(70 + Math.random() * 25),
      similarReports: Math.floor(2 + Math.random() * 15),
      progress: 10,
      stage: "AI Analysis",
      tags: challengeData.tags || ["Civic Problem"],
      affectedPeople: challengeData.affectedPeople || "1,000+",
      submittedBy: challengeData.submittedBy || "Citizen",
      submittedDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      timeline: [
        { event: "Challenge submitted successfully to CivicForge", time: "Just now", type: "neutral" },
      ],
    };

    challengesState = [newChallenge, ...challengesState];
    return newChallenge;
  },

  async validateChallenge(id: string, decision: "APPROVE" | "REJECT", priorityScore?: number): Promise<Challenge | null> {
    await new Promise((r) => setTimeout(r, 250));
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
