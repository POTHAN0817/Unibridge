import { mockUniversities } from "../data/mock/universities";
import { UniversityItem } from "../types";

export const universityService = {
  async getUniversities(): Promise<UniversityItem[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...mockUniversities];
  },

  async getUniversityById(id: string): Promise<UniversityItem | null> {
    await new Promise((r) => setTimeout(r, 150));
    return mockUniversities.find((u) => u.id === id) || null;
  },
};
