export const AD_CATEGORIES = {
  SURF_CAMP: {
    id: "surf_camp",
    label: "Surf Camp",
    emoji: "🏄‍♂️",
    monthlyPrice: 50,
    fields: ["title", "websiteUrl"],
    adPosition: "sidebar",
  },
  SHAPER: {
    id: "shaper",
    label: "Surfboard Shaper",
    emoji: "🏄",
    monthlyPrice: 25,
    fields: ["title", "websiteUrl"],
    adPosition: "sidebar",
  },
  BEER: {
    id: "beer",
    label: "Beer",
    emoji: "🍺",
    monthlyPrice: 50,
    fields: ["title", "websiteUrl"],
    adPosition: "sidebar",
  },
  COFFEE_SHOP: {
    id: "coffee_shop",
    label: "Coffee Shop",
    emoji: "☕",
    monthlyPrice: 10,
    fields: ["title", "websiteUrl"],
    adPosition: "sidebar",
  },
} as const;

export type AdCategory = keyof typeof AD_CATEGORIES;

export const GOOGLE_ADS_CONFIG = {
  dailyBudget: 23, // Combined daily budget from all contributions
  keywords: [
    "surfing south africa",
    "surf spots sa",
    "learn to surf",
    "surf gear",
    "surf equipment",
    "surf lessons",
    "surf camps",
    "surfboard shapers",
    "4x4 surf spots",
    "surf forecast",
    "surf travel",
    "surf travel south africa",
    "surf spots cape town",
    "surf spots transkei",
  ],
  location: "South Africa",
  language: "en",
} as const;
