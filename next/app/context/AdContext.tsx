// context/AdContext.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import type { Ad } from '@/app/types/ads';

// Test ad campaign data using existing public images
const TEST_ADS: Ad[] = [
  {
    id: 'ad1',
    clientId: 'client1',
    imageUrl: '/images/wave-types/beach-break.jpg',
    link: 'https://example.com/surf-shop',
    title: 'Premium Surfboards',
    isAd: true
  },
  {
    id: 'ad2',
    clientId: 'client2',
    imageUrl: '/images/wave-types/point-break.jpg',
    link: 'https://example.com/wetsuits',
    title: 'Wetsuit Sale',
    isAd: true
  },
  {
    id: 'ad3',
    clientId: 'client3',
    imageUrl: '/screen-3.png',
    link: '/images/wave-types/reef-break.jpg',
    title: 'Surf Lessons',
    isAd: true
  }
];

export const mockAds: Ad[] = [{
  id: 'surf-shop-ad',
  clientId: 'surf-shop-1',
  imageUrl: '/ads/surfboard-ad.jpg',
  link: 'https://longbeachsurfshop.co.za',
  title: 'Premium Surfboards - Long Beach Surf Shop',
  isAd: true,
  beachId: 'Long Beach'
}];

interface AdContextType {
  availableAds: Ad[];
  lastShownAdIds: Set<string>;
  updateShownAds: (newIds: Set<string>) => void;
}

const AdContext = createContext<AdContextType | null>(null);

export function AdProvider({ children }: { children: React.ReactNode }) {
  const [availableAds] = useState<Ad[]>(mockAds);
  
  return (
    <AdContext.Provider value={{
      availableAds,
      lastShownAdIds: new Set(),
      updateShownAds: () => {}
    }}>
      {children}
    </AdContext.Provider>
  );
}

export function useAdContext() {
  const context = useContext(AdContext);
  if (!context) {
    throw new Error('useAdContext must be used within an AdProvider');
  }
  return context;
}