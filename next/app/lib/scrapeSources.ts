import { WindData } from "@/app/types/wind";
import { scraperA } from "@/app/lib/scrapers/scraperA";
import { scraperB } from "@/app/lib/scrapers/scraperB";

interface RegionSourceConfig {
  region: string;
  sourceA: {
    url: string;
    scraper: (html: string, region: string) => Promise<WindData>;
  };
  sourceB: {
    url: string;
    scraper: (html: string, region: string) => Promise<WindData>;
  };
}

export const REGION_CONFIGS: RegionSourceConfig[] = [
  {
    region: "Western Cape",
    sourceA: {
      url: "https://swell.co.za/ct/simple",
      scraper: scraperA,
    },
    sourceB: {
      url: "https://www.yeeew.com/listing/africa/south-africa/cape-peninsula/cape-town/forecast",
      scraper: scraperB,
    },
  },
  {
    region: "Eastern Cape",
    sourceA: {
      url: "https://swell.co.za/el/simple",
      scraper: scraperA,
    },
    sourceB: {
      url: "",
      scraper: scraperB,
    },
  },
  {
    region: "KwaZulu-Natal",
    sourceA: {
      url: "https://swell.co.za/durban/simple",
      scraper: scraperA,
    },
    sourceB: {
      url: "",
      scraper: scraperB,
    },
  },
  {
    region: "Northern Cape",
    sourceA: {
      url: "https://swell.co.za/nolloth/simple",
      scraper: scraperA,
    },
    sourceB: {
      url: "",
      scraper: scraperB,
    },
  },
  {
    region: "Swakopmund",
    sourceA: {
      url: "https://swell.co.za/swakop/simple",
      scraper: scraperA,
    },
    sourceB: {
      url: "",
      scraper: scraperB,
    },
  },
  {
    region: "Inhambane Province",
    sourceA: {
      url: "https://swell.co.za/tofo/simple",
      scraper: scraperA,
    },
    sourceB: {
      url: "",
      scraper: scraperB,
    },
  },
  {
    region: "Ponta do Ouro",
    sourceA: {
      url: "https://swell.co.za/ponta/simple",
      scraper: scraperA,
    },
    sourceB: {
      url: "",
      scraper: scraperB,
    },
  },
  {
    region: "Madagascar South",
    sourceA: {
      url: "https://swell.co.za/androka/simple",
      scraper: scraperA,
    },
    sourceB: {
      url: "",
      scraper: scraperB,
    },
  },
  {
    region: "Madagascar East",
    sourceA: {
      url: "https://swell.co.za/antalaha/simple",
      scraper: scraperA,
    },
    sourceB: {
      url: "",
      scraper: scraperB,
    },
  },
];

export type ValidRegion = (typeof REGION_CONFIGS)[number]["region"];
