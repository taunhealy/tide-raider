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

export interface AdRequest {
  id: string;
  companyName: string;
  contactEmail: string;
  imageUrl?: string | null;
  linkUrl: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  rejectionReason?: string | null;
  userId?: string | null;
  category: string;
  categoryData?: any;
  googleAdsCampaignId?: string | null;
  googleAdsContribution: number;
  regionId: string;
  title?: string | null;
  yearlyPrice: number;
  startDate: Date;
  endDate: Date;
  payfastSubscriptionId?: string | null;
  paypalSubscriptionId?: string | null;
  variantId?: string | null;
  ad?: Ad;
}

export interface Ad {
  id: string;
  requestId: string;
  companyName: string;
  title?: string | null;
  category: string;
  linkUrl: string;
  imageUrl?: string | null;
  regionId: string;
  country?: string | null;
  status: string;
  startDate: Date;
  endDate: Date;
  paypalSubscriptionId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId?: string | null;
  targetedBeaches?: string[];
  adRequest?: AdRequest;
  isAd?: boolean;
  beachConnections?: Array<{ beachId: string }>;
  _count?: {
    clicks: number;
  };
}

export interface AdImpression {
  adId: string;
  clientId: string;
  timestamp: number;
  duration: number;
  userId?: string;
}

export interface AdvertisingFormData {
  companyName: string; // Required - Business name
  websiteUrl: string; // Required - Website URL
}

export interface CreateAdRequestPayload {
  title: string;
  companyName?: string;
  contactEmail?: string;
  linkUrl: string;
  category: string;
  regionId: string;
  targetedBeaches: string[];
  status?: string;
  yearlyPrice?: number;
}

export interface Service {
  type: string;
  name: string;
  category: string;
  url?: string;
  isAd: boolean;
  adId?: string;
}

export type { AdCampaign };
