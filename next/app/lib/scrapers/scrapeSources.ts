import { WindData } from "@/app/types/wind";
import { scraperA } from "@/app/lib/scrapers/scraperA";

interface RegionSourceConfig {
  region: string;
  sourceA: {
    url: string;
    scraper: (
      html: string,
      region: string
    ) => Promise<{ [key: string]: WindData }>;
  };
}

export const REGION_CONFIGS: RegionSourceConfig[] = [
  {
    region: "Western Cape",
    sourceA: {
      url: "https://www.windfinder.com/forecast/muizenberg_beach",
      scraper: scraperA,
    },
  },
  {
    region: "Eastern Cape",
    sourceA: {
      url: "https://www.windfinder.com/forecast/jeffreys_bay",
      scraper: scraperA,
    },
  },
  {
    region: "KwaZulu-Natal",
    sourceA: {
      url: "https://www.windfinder.com/forecast/durban_bluff",
      scraper: scraperA,
    },
  },
  {
    region: "Northern Cape",
    sourceA: {
      url: "https://www.windfinder.com/forecast/port_nolloth",
      scraper: scraperA,
    },
  },
  {
    region: "Swakopmund",
    sourceA: {
      url: "https://www.windfinder.com/forecast/swakopmund",
      scraper: scraperA,
    },
  },
  {
    region: "Inhambane Province",
    sourceA: {
      url: "https://www.windfinder.com/forecast/tofo",
      scraper: scraperA,
    },
  },
  {
    region: "Ponta do Ouro",
    sourceA: {
      url: "https://www.windfinder.com/forecast/ponta_do_ouro",
      scraper: scraperA,
    },
  },
  {
    region: "Madagascar South",
    sourceA: {
      url: "https://www.windfinder.com/forecast/anakao",
      scraper: scraperA,
    },
  },
  {
    region: "Madagascar East",
    sourceA: {
      url: "https://www.windfinder.com/forecast/farafangana",
      scraper: scraperA,
    },
  },
];

export type ValidRegion = (typeof REGION_CONFIGS)[number]["region"];
