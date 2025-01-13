export interface SectionData {
  data: any;
} 

// types/ads.ts
export interface Ad {
  id: string;
  clientId: string;
  imageUrl?: string;
  link?: string;
  isAd: true;
}

export interface AdImpression {
  adId: string;
  clientId: string;
  timestamp: number;
  duration: number;
  userId?: string;
}