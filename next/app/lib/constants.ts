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
};

export const DEFAULT_PROFILE_IMAGE = "/images/profile/hero-cover.jpg";

export const WAVE_TYPE_ICONS = {
  "Beach Break": "/images/wave-types/beach-break.jpg",
  "Point Break": "/images/wave-types/point-break.jpg",
  "Reef Break": "/images/wave-types/reef-break.jpg",
  "Beach and Reef Break": "/images/wave-types/beach-reef-break.jpg",
  "Beach and Point Break":
    "https://media.tideraider.com/wave-type-beach-point.jpg",
} as const;

export type WaveType = keyof typeof WAVE_TYPE_ICONS;

export const STORY_CATEGORIES = [
  "Wildlife Encounters",
  "Hidden Gems",
  "Rad Towns",
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
  "UFO Sightings 👽🛸",
  "Great Surf Camps",
  "Surf Vlog",
  "Surf Photography",
  "Storm Alert"
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
    monthlyPrice: 500,
    fields: ["title", "websiteUrl"],
    adPosition: "sidebar",
  },
  SHAPER: {
    id: "shaper",
    label: "Surfboard Shaper",
    monthlyPrice: 250,
    fields: ["title", "websiteUrl"],
    adPosition: "sidebar",
  },
  BEER: {
    id: "beer",
    label: "Beer",
    monthlyPrice: 500,
    fields: ["title", "websiteUrl"],
    adPosition: "sidebar",
  },
} as const;

export type AdCategory = keyof typeof AD_CATEGORIES;
