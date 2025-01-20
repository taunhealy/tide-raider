interface AdCampaign {
  id: string;
  clientId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  ads: Ad[];
  status: "active" | "paused" | "completed";
  targeting?: {
    regions?: string[];
    devices?: string[];
    timeOfDay?: string[];
  };
}
export interface Ad {
  id: string;
  category: string;
  companyName: string;
  imageUrl?: string;
  linkUrl: string;
  title?: string;
  region: string;
  startDate: Date;
  endDate: Date;
  status: "active" | "pending" | "rejected";
  categoryData?: Record<string, any>;
  yearlyPrice: number;
  googleAdsContribution: number;
  isAd: true;
}

export interface AdImpression {
  adId: string;
  clientId: string;
  timestamp: number;
  duration: number;
  userId?: string;
}

export type { AdCampaign };
