export const HARDCODED_WIND_DATA = {
  wind: {
    direction: "SE",
    speed: 15,
  },
  swell: {
    height: 2.5,
    direction: "225",
    period: 12,
    cardinalDirection: "SW",
  },
  timestamp: Date.now(),
};

export const MAX_DISTANCE = 10000;

export const INITIAL_FILTERS = {
  continent: [],
  country: [],
  waveType: [],
  difficulty: [],
  region: [],
  crimeLevel: [],
  minPoints: 0,
  sharkAttack: [],
  minDistance: 0,
  maxDistance: 10000,
};

export const DEFAULT_PROFILE_IMAGE = "/images/profile/hero-cover.jpg";

export const WAVE_TYPE_ICONS = {
  "Beach Break": "/images/wave-types/beach-break.jpg",
  "Point Break": "/images/wave-types/point-break.jpg",
  "Reef Break": "/images/wave-types/reef-break.jpg",
  "Beach and Reef Break": "/images/wave-types/beach-reef-break.jpg",
} as const;

export type WaveType = keyof typeof WAVE_TYPE_ICONS;

export const STORY_CATEGORIES = [
  "Longest Wave",
  "Best Barrels",
  "Wildlife Encounters",
  "Hidden Gems",
  "Epic Road Trips",
  "Coastal Adventures",
  "Cultural Experiences",
  "Survival Stories",
  "Camping Adventures",
  "Storm Stories",
  "Environmental Impact",
  "Seasonal Changes",
  "Local Surfing Legends",
  "Boat Access Spots",
  "Weather Phenomena",
  "Restricted Access Spots",
  "Crime",
];

export type StoryCategory = (typeof STORY_CATEGORIES)[number];

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

export const AD_CATEGORIES = {
  SURF_CAMP: {
    id: "surf_camp",
    label: "Surf Camp",
    monthlyPrice: 100,
    fields: ["title", "description", "websiteUrl"],
    adPosition: "sidebar",
    googleAdsContribution: 30, // 30% of monthly price
  },
  SHAPER: {
    id: "shaper",
    label: "Surfboard Shaper",
    monthlyPrice: 100,
    fields: ["title", "description", "websiteUrl"],
    adPosition: "sidebar",
    googleAdsContribution: 30,
  },
  PRODUCTS: {
    id: "products",
    label: "Surf Products",
    monthlyPrice: 150,
    fields: ["title", "description", "websiteUrl"],
    adPosition: "sidebar",
    googleAdsContribution: 45,
  },
  FOUR_BY_FOUR: {
    id: "four_by_four",
    label: "4x4 Services",
    monthlyPrice: 150,
    fields: ["title", "description", "websiteUrl"],
    adPosition: "sidebar",
    googleAdsContribution: 45,
  },
} as const;

export type AdCategory = keyof typeof AD_CATEGORIES;
