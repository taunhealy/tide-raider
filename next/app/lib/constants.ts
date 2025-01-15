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
  region: ["Western Cape"],
  difficulty: [],
  crimeLevel: [],
  waveType: [],
  minDistance: 0,
  maxDistance: 10000,
  sharkAttack: [],
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
  "Travel",
  "Wipeouts",
  "Crime",
  "Favourite Sessions",
  "Wildlife Encounters",
] as const;

export type StoryCategory = (typeof STORY_CATEGORIES)[number];
