interface AdCampaign {
  id: string;
  clientId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  budget: number;
  ads: Ad[];
  status: 'active' | 'paused' | 'completed';
  targeting?: {
    regions?: string[];
    devices?: string[];
    timeOfDay?: string[];
  };
}

export interface Ad {
  id: string;
  clientId: string;
  imageUrl?: string;
  link?: string;
  title?: string;
  isAd: true;
  campaignId?: string;
  impressions?: number;
  clicks?: number;
}

export interface AdImpression {
  adId: string;
  clientId: string;
  timestamp: number;
  duration: number;
  userId?: string;
}

export type { AdCampaign };