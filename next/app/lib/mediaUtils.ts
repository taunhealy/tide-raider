import { Ad } from "@/app/types/ads";

interface MediaItem {
  url: string;
  title: string;
  platform: "youtube" | "vimeo";
}

interface CoffeeShop {
  name: string;
}

interface Beach {
  id: string;
  name: string;
  advertisingPrice?: number;
  shaper?: { name: string; url?: string }[];
  beer?: { name: string; url?: string }[];
  region: string;
}

export function getMediaGridItems(
  videos: MediaItem[] = [],
  coffeeShops: CoffeeShop[] = [],
  beach: Beach,
  ads: Ad[] = []
) {
  const items = [];
  const shownAdClientIds = new Set<string>();

  // Filter ads for this specific beach
  const beachAds =
    ads?.filter(
      (ad) => ad.status === "active" && ad.targetedBeaches?.includes(beach.id)
    ) || [];

  // Group ads by category
  const adsByCategory = beachAds.reduce(
    (acc, ad) => {
      if (!acc[ad.category]) {
        acc[ad.category] = [];
      }
      acc[ad.category].push(ad);
      return acc;
    },
    {} as Record<string, Ad[]>
  );

  // Add video (either from ads or from videos array)
  if (videos && videos.length > 0) {
    const availableVideos = [...videos];
    const randomIndex = Math.floor(Math.random() * availableVideos.length);
    items.push({
      type: "video",
      ...availableVideos[randomIndex],
    });
  }

  // Add coffee shop (either from ads or from beach data)
  if (adsByCategory["coffee"] && adsByCategory["coffee"].length > 0) {
    // Use a coffee shop ad
    const coffeeAd = adsByCategory["coffee"][0];
    items.push({
      type: "coffeeShop",
      name: coffeeAd.title || coffeeAd.companyName,
      url: coffeeAd.linkUrl,
      isAd: true,
      adId: coffeeAd.id,
    });
    if (coffeeAd.userId) {
      shownAdClientIds.add(coffeeAd.userId);
    }
  } else if (coffeeShops?.length > 0) {
    // Use a regular coffee shop
    items.push({
      type: "coffeeShop",
      ...coffeeShops[0],
    });
  }

  // Add shaper (either from ads or from beach data)
  if (adsByCategory["shaper"] && adsByCategory["shaper"].length > 0) {
    // Use a shaper ad
    const shaperAd = adsByCategory["shaper"][0];
    items.push({
      type: "shaper",
      name: shaperAd.title || shaperAd.companyName,
      url: shaperAd.linkUrl,
      isAd: true,
      adId: shaperAd.id,
    });
    if (shaperAd.userId) {
      shownAdClientIds.add(shaperAd.userId);
    }
  } else if (beach.shaper && beach.shaper.length > 0) {
    // Use a regular shaper
    items.push({
      type: "shaper",
      name: beach.shaper[0].name,
      url: beach.shaper[0].url,
    });
  }

  // Add beer (either from ads or from beach data)
  if (adsByCategory["beer"] && adsByCategory["beer"].length > 0) {
    // Use a beer ad
    const beerAd = adsByCategory["beer"][0];
    items.push({
      type: "beer",
      name: beerAd.title || beerAd.companyName,
      url: beerAd.linkUrl,
      isAd: true,
      adId: beerAd.id,
    });
    if (beerAd.userId) {
      shownAdClientIds.add(beerAd.userId);
    }
  } else if (beach.beer && beach.beer.length > 0) {
    // Use a regular beer
    items.push({
      type: "beer",
      name: beach.beer[0].name,
      url: beach.beer[0].url,
    });
  }

  return {
    items,
    shownAdClientIds,
  };
}
