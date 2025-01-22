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
  imageUrl: string | null | undefined;
  linkUrl: string;
  title: string | null;
  region: string;
  startDate: Date;
  endDate: Date;
  status: string;
  categoryData: any;
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
