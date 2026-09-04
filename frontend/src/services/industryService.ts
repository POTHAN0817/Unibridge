import { mockIndustryPartners } from "../data/mock/industryPartners";
import { IndustryPartnerItem } from "../types";

export const industryService = {
  async getPartners(): Promise<IndustryPartnerItem[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...mockIndustryPartners];
  },

  async getPartnerById(id: string): Promise<IndustryPartnerItem | null> {
    await new Promise((r) => setTimeout(r, 150));
    return mockIndustryPartners.find((i) => i.id === id) || null;
  },
};
