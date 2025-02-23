import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import {
  degreesToCardinal,
  isBeachSuitable,
  formatConditionsResponse,
} from "@/app/lib/surfUtils";

import { redis } from "@/app/lib/redis";
import { VALID_REGIONS, ValidRegion } from "@/app/lib/constants";
import { storeGoodBeachRatings } from "@/app/lib/beachRatings";
import { WindData } from "@/app/types/wind";
import { REGION_CONFIGS } from "@/app/lib/scrapeSources";

interface RegionScrapeConfig {
  url: string;
  region: string;
}

interface ScrapeResult {
  region: string;
  windDirection: string;
  windSpeed: number;
  swellHeight: number;
  swellDirection: number;
  swellPeriod: number;
}

function getTodayDate() {
  const date = new Date();
  // Set to start of day in UTC
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

// Add these constants at the top
const SCRAPE_TIMEOUT = 15000; // Reduce to 15 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds
const CONCURRENT_SCRAPE_LIMIT = 3; // Limit concurrent scrapes

// Add these constants at the top
const REDIS_KEYS = {
  RATE_LIMIT: (region: string) => `rate-limit:${region}`,
  CACHE: (region: string, date: string) => `surf-conditions:${region}:${date}`,
  SCRAPE_LOCK: (date: string) => `scrape-lock:${date}`,
};

const CACHE_TIMES = {
  RATE_LIMIT: 60 * 60, // 1 hour rate limit window
  getRedisExpiry: () => {
    const now = new Date();
    const endOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );
    // Get seconds until end of day
    return Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
  },
  SCRAPE_LOCK: 60 * 2, // 2 minute scrape lock
};

async function scrapeAllRegions(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  for (const config of REGION_CONFIGS) {
    try {
      // Try swell.co.za first
      const response = await axios.get(config.url);
      const $ = cheerio.load(response.data);

      // Existing swell.co.za scraping logic
      const windDirection =
        $(
          'div[style="display:block; width: 49px; height:20px; line-height:20px;  text-align: center; float:left; vertical-align: middle; background-color: white; border: 0px solid orange; color: black;"]'
        )
          .first()
          .text()
          .trim() || "N/A";

      const windSpeed =
        parseFloat(
          $(
            'div[style*="width: 20px"][style*="height:20px"][style*="background-color: rgb(255, 255, 255)"][style*="color: rgb(0, 0, 0)"]'
          )
            .first()
            .text()
            .trim()
        ) || 0;

      const waveHeight =
        parseFloat(
          $('div[style*="width: 49px"][style*="height:20px"]')
            .filter((_, el) => {
              const num = parseFloat($(el).text());
              return !isNaN(num) && num > 0 && num <= 5.0;
            })
            .first()
            .text()
            .trim()
        ) || 0;

      const swellPeriod =
        parseFloat(
          $('div[style*="width: 49px"][style*="height:20px"]')
            .filter((_, el) => {
              const num = parseFloat($(el).text());
              return !isNaN(num) && num >= 5 && num <= 25;
            })
            .first()
            .text()
            .trim()
        ) || 0;

      const swellDirection = parseInt(
        $('div[style*="width: 49px"]')
          .filter((_, el) => $(el).text().includes("°"))
          .first()
          .text()
          .trim()
          .split("\n")
          .pop()
          ?.replace("°", "") || "0",
        10
      );

      results.push({
        region: config.region,
        windSpeed: windSpeed,
        windDirection: windDirection,
        swellHeight: waveHeight,
        swellPeriod: swellPeriod,
        swellDirection: swellDirection,
      });
    } catch (error) {
      console.error(`Error scraping ${config.region} from swell.co.za:`, error);

      // For any region that fails, try Yeeew.com as fallback
      try {
        console.log(`Attempting to fetch ${config.region} data from Yeeew.com`);

        // Map regions to their Yeeew.com URLs
        const yeeewUrls: { [key: string]: string } = {
          "Western Cape":
            "https://www.yeeew.com/listing/africa/south-africa/cape-peninsula/cape-town/forecast",
          // Add more region mappings as needed
        };

        if (yeeewUrls[config.region]) {
          const yeeewResponse = await axios.get(yeeewUrls[config.region]);
          const $ = cheerio.load(yeeewResponse.data);

          const windInfo = $("#windCurrentParamsText span").text().split(" ");
          const windSpeed = convertMphToKmh(parseFloat(windInfo[0]));
          const windDirection = convertWindDirection(windInfo[2]);

          const swellInfo = $("#waveCurrentParamsText span").text().split(" ");
          const swellHeight = parseFloat(swellInfo[0]);
          const swellPeriod = parseFloat(swellInfo[3].replace("s", ""));
          const swellDirection = convertSwellDirection(swellInfo[4]);

          results.push({
            region: config.region,
            windSpeed: windSpeed,
            windDirection: windDirection,
            swellHeight: swellHeight,
            swellPeriod: swellPeriod,
            swellDirection: swellDirection,
          });

          console.log(
            `Successfully fetched ${config.region} data from Yeeew.com`
          );
          continue; // Move to next region after successful fallback
        }
      } catch (yeeewError) {
        console.error(
          `Failed to fetch ${config.region} data from Yeeew.com:`,
          yeeewError
        );
      }
    }
  }

  if (results.length === 0) {
    throw new Error("Failed to scrape data from any source");
  }

  return results;
}

// Helper functions for Yeeew.com data conversion
function convertWindDirection(direction: string): string {
  const directions: { [key: string]: string } = {
    N: "0°",
    NNE: "22.5°",
    NE: "45°",
    ENE: "67.5°",
    E: "90°",
    ESE: "112.5°",
    SE: "135°",
    SSE: "157.5°",
    S: "180°",
    SSW: "202.5°",
    SW: "225°",
    WSW: "247.5°",
    W: "270°",
    WNW: "292.5°",
    NW: "315°",
    NNW: "337.5°",
  };
  return directions[direction] || "N/A";
}

function convertMphToKmh(mph: number): number {
  return Math.round(mph * 1.60934);
}

// Add validation function
function isValidRegion(region: string): region is ValidRegion {
  return VALID_REGIONS.includes(region as ValidRegion);
}

async function getLatestConditions(
  forceRefresh = false,
  region: ValidRegion = "Western Cape"
) {
  const today = getTodayDate();
  console.log("🔍 Checking conditions for", region, "on", today);

  // 1. Check database first
  const existingConditions = await prisma.surfCondition.findFirst({
    where: {
      date: today,
      region: region,
    },
    orderBy: { updatedAt: "desc" },
  });

  console.log("📊 Database check result:", existingConditions);

  if (existingConditions) {
    // Store good beach ratings if they don't exist
    if (existingConditions?.forecast) {
      await storeGoodBeachRatings(
        formatConditionsResponse(existingConditions),
        region,
        today
      );
    }
    return formatConditionsResponse(existingConditions);
  }

  // 2. If no data exists, scrape
  console.log("🌐 No data found, scraping fresh data for", region);
  const scrapedData = await scrapeAllRegions();
  console.log("📥 Scraped data:", scrapedData);

  if (!scrapedData?.length) {
    console.log("❌ No data scraped");
    return null;
  }

  // 3. Store scraped data
  await prisma.surfCondition.createMany({
    data: scrapedData.map((regionData) => ({
      id: randomUUID(),
      date: getTodayDate(),
      region: regionData.region,
      forecast: {
        wind: {
          speed: regionData.windSpeed,
          direction: regionData.windDirection,
        },
        swell: {
          height: regionData.swellHeight,
          period: regionData.swellPeriod,
          direction: regionData.swellDirection,
        },
      },
    })),
  });

  // 4. Store good beach ratings for each region
  for (const conditions of scrapedData) {
    await storeGoodBeachRatings(
      formatConditionsResponse(conditions),
      conditions.region,
      today
    );
  }

  const requestedRegionData = scrapedData.find(
    (data) => data.region === region
  );

  return requestedRegionData
    ? formatConditionsResponse(requestedRegionData)
    : null;
}

// New helper function to fetch other regions in the background
async function backgroundFetchOtherRegions(today: Date) {
  const queryDate = new Date(today);
  queryDate.setUTCHours(0, 0, 0, 0);

  // Check both forecast tables
  const existingRegionsA = await prisma.forecastA.findMany({
    where: { date: queryDate },
    select: { region: true },
  });

  const existingRegionsB = await prisma.forecastB.findMany({
    where: { date: queryDate },
    select: { region: true },
  });

  // Combine unique regions from both sources
  const existingRegions = [
    ...new Set([
      ...existingRegionsA.map((r) => r.region),
      ...existingRegionsB.map((r) => r.region),
    ]),
  ];

  // Find regions we need to fetch
  const regionsToFetch = REGION_CONFIGS.filter(
    (config) => !existingRegions.includes(config.region)
  );

  if (regionsToFetch.length === 0) {
    console.log("All regions already fetched for today");
    return;
  }

  console.log("🌐 Background fetching data for remaining regions...");

  // Fetch and store data for remaining regions
  for (const config of regionsToFetch) {
    try {
      const response = await axios.get(config.url);
      const html = response.data;
      const $ = cheerio.load(html);

      const windDirection =
        $(
          'div[style="display:block; width: 49px; height:20px; line-height:20px;  text-align: center; float:left; vertical-align: middle; background-color: white; border: 0px solid orange; color: black;"]'
        )
          .first()
          .text()
          .trim() || "N/A";

      const windSpeed =
        parseFloat(
          $(
            'div[style*="width: 20px"][style*="height:20px"][style*="background-color: rgb(255, 255, 255)"][style*="color: rgb(0, 0, 0)"]'
          )
            .first()
            .text()
            .trim()
        ) || 0;

      const waveHeight =
        parseFloat(
          $('div[style*="width: 49px"][style*="height:20px"]')
            .filter((_, el) => {
              const num = parseFloat($(el).text());
              return !isNaN(num) && num > 0 && num <= 5.0;
            })
            .first()
            .text()
            .trim()
        ) || 0;

      const swellPeriod =
        parseFloat(
          $('div[style*="width: 49px"][style*="height:20px"]')
            .filter((_, el) => {
              const num = parseFloat($(el).text());
              return !isNaN(num) && num >= 5 && num <= 25;
            })
            .first()
            .text()
            .trim()
        ) || 0;

      const swellDirection = parseInt(
        $('div[style*="width: 49px"]')
          .filter((_, el) => $(el).text().includes("°"))
          .first()
          .text()
          .trim()
          .split("\n")
          .pop()
          ?.replace("°", "") || "0",
        10
      );

      await prisma.forecastA.create({
        data: {
          region: config.region,
          forecast: {
            wind: {
              speed: windSpeed,
              direction: windDirection,
            },
            swell: {
              height: waveHeight,
              period: swellPeriod,
              direction: swellDirection,
            },
          },
          date: today,
          updatedAt: new Date(),
        },
      });

      console.log(`Background fetch completed for ${config.region}`);
    } catch (error) {
      console.error(`Error background fetching ${config.region}:`, error);
    }
  }
}

// Add rate limit helper
async function checkRateLimit(region: string): Promise<boolean> {
  const key = REDIS_KEYS.RATE_LIMIT(region);
  const limit = await redis.incr(key);

  if (limit === 1) {
    // Set expiry on first request
    await redis.expire(key, CACHE_TIMES.RATE_LIMIT);
  }

  // Allow 30 requests per hour per region
  return limit <= 30;
}

// Add source configurations
interface SourceConfig {
  id: "A" | "B";
  name: string;
  regions: {
    [key: string]: {
      url: string;
      scraper: (html: string) => Promise<ScrapeResult>;
    };
  };
}

const SOURCES: SourceConfig[] = [
  {
    id: "A",
    name: "Swell.co.za",
    regions: {
      "Western Cape": {
        url: "https://swell.co.za/ct/simple",
        scraper: async (html) => {
          const $ = cheerio.load(html);
          // Existing swell.co.za scraping logic
          return {
            // ... existing scrape result format
          };
        },
      },
      // ... other regions for source A
    },
  },
  {
    id: "B",
    name: "Yeeew.com",
    regions: {
      "Western Cape": {
        url: "https://www.yeeew.com/listing/africa/south-africa/cape-peninsula/cape-town/forecast",
        scraper: async (html): Promise<ScrapeResult> => {
          const $ = cheerio.load(html);
          return {
            region: "Western Cape",
            windDirection: "N/A",
            windSpeed: 0,
            swellHeight: 0,
            swellPeriod: 0,
            swellDirection: 0,
          };
          // TODO: Implement actual Yeeew.com scraping logic
        },
      },
      // ... other regions for source B
    },
  },
];

export const dynamic = "force-dynamic";

async function getExistingForecast(
  source: "A" | "B",
  region: string,
  date: Date
) {
  const model = source === "A" ? prisma.forecastA : prisma.forecastB;

  return await model.findFirst({
    where: {
      date: date,
      region: region,
    },
    orderBy: { updatedAt: "desc" },
  });
}

async function storeForecast(source: "A" | "B", data: any) {
  const model = source === "A" ? prisma.forecastA : prisma.forecastB;

  return await model.create({
    data: {
      id: randomUUID(),
      date: getTodayDate(),
      region: data.region,
      forecast: data,
    },
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "Western Cape";
  const source = searchParams.get("source") || "A";
  const today = getTodayDate();

  // 1. Check Redis cache
  const cacheKey = `surf:${source}:${region}:${today.toISOString()}`;
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    return NextResponse.json(JSON.parse(cachedData));
  }

  // 2. Check database
  const model = source === "A" ? prisma.forecastA : prisma.forecastB;
  const existingForecast = await model.findFirst({
    where: {
      date: today,
      region: region,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (existingForecast) {
    await redis.setex(
      cacheKey,
      CACHE_TIMES.getRedisExpiry(),
      JSON.stringify(existingForecast.forecast)
    );
    return NextResponse.json(existingForecast.forecast);
  }

  // 3. Scrape if no data exists
  try {
    const regionConfig = REGION_CONFIGS.find(
      (config) => config.region === region
    );
    if (!regionConfig) {
      throw new Error(`Invalid region: ${region}`);
    }

    const sourceConfig =
      source === "A" ? regionConfig.sourceA : regionConfig.sourceB;
    if (!sourceConfig.url) {
      throw new Error(`No URL configured for ${region} in source ${source}`);
    }

    const response = await axios.get(sourceConfig.url);
    const data = await sourceConfig.scraper(response.data, region);

    // Store in database
    await model.create({
      data: {
        id: randomUUID(),
        date: today,
        region: region,
        forecast: data,
      },
    });

    // Cache the result
    await redis.setex(
      cacheKey,
      CACHE_TIMES.getRedisExpiry(),
      JSON.stringify(data)
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Source ${source} failed:`, error);

    // Try backup source if primary fails
    if (source === "A") {
      try {
        const regionConfig = REGION_CONFIGS.find(
          (config) => config.region === region
        );
        if (regionConfig?.sourceB.url) {
          const response = await axios.get(regionConfig.sourceB.url);
          const data = await regionConfig.sourceB.scraper(
            response.data,
            region
          );

          await prisma.forecastB.create({
            data: {
              id: randomUUID(),
              date: today,
              region: region,
              forecast: data,
            },
          });

          await redis.setex(
            `surf:B:${region}:${today.toISOString()}`,
            CACHE_TIMES.getRedisExpiry(),
            JSON.stringify(data)
          );

          return NextResponse.json(data);
        }
      } catch (backupError) {
        console.error("Backup source failed:", backupError);
      }
    }

    return NextResponse.json(
      {
        error: "Failed to fetch surf conditions",
        source: source === "A" ? "both sources" : "source B",
      },
      { status: 503 }
    );
  }
}

async function ensureGoodRatings(region: string, date: Date, conditions: any) {
  try {
    // Check if ratings exist for this date/region
    const existingRatings = await prisma.beachGoodRating.count({
      where: {
        date: date,
        region: region,
      },
    });

    if (existingRatings === 0) {
      console.log(
        `🔄 No ratings found for ${region} on ${date}, regenerating...`
      );
      await storeGoodBeachRatings(
        formatConditionsResponse(conditions.forecast),
        region,
        date
      );
    }
  } catch (error) {
    console.error("Rating ensure check failed:", error);
  }
}

function convertSwellDirection(direction: string): number {
  const directions: { [key: string]: number } = {
    N: 0,
    NNE: 22.5,
    NE: 45,
    ENE: 67.5,
    E: 90,
    ESE: 112.5,
    SE: 135,
    SSE: 157.5,
    S: 180,
    SSW: 202.5,
    SW: 225,
    WSW: 247.5,
    W: 270,
    WNW: 292.5,
    NW: 315,
    NNW: 337.5,
  };
  return directions[direction] || 0;
}
