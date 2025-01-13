import { Ad } from '@/app/types/ads';

interface MediaItem {
  url: string;
  title: string;
  platform: 'youtube' | 'vimeo';
}

interface CoffeeShop {
  url: string;
  name: string;
}

interface Beach {
  name: string;
  advertisingPrice?: number;
}

export function getMediaGridItems(
  videos: MediaItem[] = [], 
  coffeeShops: CoffeeShop[] = [],
  availableAds: Ad[] = [],
  beach: Beach
) {
  const items = [];

  // Add a random video if available
  if (videos.length > 0) {
    // Create a copy of the videos array to avoid modifying the original
    const availableVideos = [...videos];
    // Get a random index based on the current length
    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    // Add the randomly selected video
    items.push({
      type: 'video',
      ...availableVideos[randomIndex]
    });
  }

  if (coffeeShops.length > 0) {
    items.push({
      type: 'coffeeShop',
      ...coffeeShops[0]
    });
  }

  // Add active ads if available
  if (availableAds.length > 0) {
    items.push(availableAds[0]);
  } 
  // Add ad placeholder if beach has advertising price and no active ad
  else if (beach.advertisingPrice) {
    items.push({
      type: 'ad',
      isAd: true,
      imageUrl: '',  // Empty for placeholder
      link: '',
      title: ''
    });
  }

  return {
    items,
    shownAdClientIds: new Set(items
      .filter(item => 'clientId' in item && item.clientId !== 'placeholder')
      .map(item => (item as Ad).clientId)
    )
  };
} 