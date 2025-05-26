import apiService from "./apiService";
import { BadgesResponse, EarnedBadgesResponse } from "@/types/badge";

export const badgeService = {
  /**
   * Fetch all badges with progress information
   */
  getAllBadges: async (): Promise<BadgesResponse> => {
    return await apiService.get("/badges");
  },

  /**
   * Fetch only earned badges
   */
  getEarnedBadges: async (): Promise<EarnedBadgesResponse> => {
    return await apiService.get("/badges/earned");
  },
};

export default badgeService;
