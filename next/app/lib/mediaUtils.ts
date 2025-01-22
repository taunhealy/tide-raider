import { Ad } from "@/app/types/ads";

interface MediaItem {
  url: string;
  title: string;
  platform: "youtube" | "vimeo";
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
  beach: Beach
) {
  const items = [];

  if (videos.length > 0) {
    const availableVideos = [...videos];
    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    items.push({
      type: "video",
      ...availableVideos[randomIndex],
    });
  }

  if (coffeeShops.length > 0) {
    items.push({
      type: "coffeeShop",
      ...coffeeShops[0],
    });
  }

  return {
    items,
    shownAdClientIds: new Set<string>(), // Add empty Set for compatibility
  };
}
