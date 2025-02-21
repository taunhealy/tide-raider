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
import { beachData, WindData } from "@/app/types/beaches";
import { VALID_REGIONS, ValidRegion } from "@/app/lib/constants";
import { storeGoodBeachRatings } from "@/app/lib/beachRatings";

interface RegionScrapeConfig {
  url: string;
  region: string;
}

const REGION_CONFIGS: RegionScrapeConfig[] = [
  {
    url: "https://swell.co.za/ct/simple",
    region: "Western Cape",
  },
  {
    url: "https://swell.co.za/el/simple",
    region: "Eastern Cape",
  },
  {
    url: "https://swell.co.za/durban/simple",
    region: "KwaZulu-Natal",
  },
  {
    url: "https://swell.co.za/nolloth/simple",
    region: "Northern Cape",
  },
  {
    url: "https://swell.co.za/lua/simple",
    region: "Luanda Province",
  },
  {
    url: "https://swell.co.za/swmay/simple",
    region: "Mayotte",
  },
  {
    url: "https://swell.co.za/ben/simple",
    region: "Benguela",
  },
  {
    url: "https://swell.co.za/swakop/simple",
    region: "Swakopmund",
  },
  {
    url: "https://swell.co.za/tofo/simple",
    region: "Inhambane Province",
  },
  {
    url: "https://swell.co.za/ponta/simple",
    region: "Ponta do Ouro",
  },
  {
    url: "https://swell.co.za/androka/simple",
    region: "Madagascar South",
  },
  {
    url: "https://swell.co.za/antalaha/simple",
    region: "Madagascar East",
  },
  {
    url: "https://swell.co.za/morombe/simple",
    region: "Madagascar West",
  },
];

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
const SCRAPE_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function scrapeAllRegions(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  for (const config of REGION_CONFIGS) {
    let retries = MAX_RETRIES;
    while (retries > 0) {
      try {
        console.log(
          `Starting scrape for ${config.region} from ${config.url}...`
        );

        const response = await axios.get(config.url, {
          timeout: SCRAPE_TIMEOUT,
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        });

        const html = response.data;
        const $ = cheerio.load(html);

        // Updated wind direction selector and parsing
        const windDirection = $(
          'div[style="display:block; width: 49px; height:20px; line-height:20px;  text-align: center; float:left; vertical-align: middle; background-color: white; border: 0px solid orange; color: black;"]'
        )
          .first()
          .text()
          .trim();

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
          windDirection: windDirection || "0",
          windSpeed,
          swellHeight: waveHeight,
          swellDirection,
          swellPeriod,
        });

        console.log(
          `Successfully scraped data for ${config.region}:`,
          results[results.length - 1]
        );
        break;
      } catch (error) {
        retries--;
        console.error(`Scraping error for ${config.region}:`, {
          message: (error as Error).message,
          status: (error as any).response?.status,
          statusText: (error as any).response?.statusText,
          retries_left: retries,
        });

        if (retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          continue;
        }
        // Only throw if we're out of retries
        if (retries === 0) throw error;
      }
    }
  }

  if (results.length === 0) {
    throw new Error("Failed to scrape data from all regions");
  }

  return results;
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
  // Check which regions we already have data for
  const queryDate = new Date(today);
  queryDate.setUTCHours(0, 0, 0, 0);

  const existingRegions = await prisma.surfCondition.findMany({
    where: {
      date: queryDate,
    },
    select: {
      region: true,
    },
  });

  // Find regions we need to fetch
  const regionsToFetch = REGION_CONFIGS.filter(
    (config) => !existingRegions.some((r) => r.region === config.region)
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

      await prisma.surfCondition.create({
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

// Constants for time intervals
const CACHE_TIMES = {
  // Cache until end of current day (23:59:59)
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
    return Math.floor((endOfDay.getTime() - now.getTime()) / 1000);
  },
  SCRAPE_LOCK: 60 * 10, // 10 minute lock to prevent multiple scrapes
};

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region") || "Western Cape";
  const date =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  console.log(`🌊 Starting request for ${region} on ${date}`);

  try {
    // First, check if we have ratings for today
    const existingRatings = await prisma.beachGoodRating.findFirst({
      where: {
        date: new Date(date),
      },
    });

    // If no ratings exist for today, force a fresh scrape
    if (!existingRatings) {
      console.log("No ratings found for today, forcing fresh scrape...");
      const scrapedData = await scrapeAllRegions();

      // Store conditions and ratings for all regions
      for (const data of scrapedData) {
        const formattedData = {
          region: data.region,
          wind: {
            speed: data.windSpeed,
            direction: data.windDirection,
          },
          swell: {
            height: data.swellHeight,
            period: data.swellPeriod,
            direction: data.swellDirection,
          },
        };

        await storeGoodBeachRatings(formattedData, data.region, new Date(date));
      }
    }

    // Now proceed with normal cache/DB checks for conditions
    const cacheKey = `surf-conditions:${region}:${date}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData && typeof cachedData === "string") {
      try {
        const parsedData = JSON.parse(cachedData);
        return NextResponse.json(parsedData);
      } catch (error) {
        console.error(`❌ Cache parse error for ${region}:`, error);
        await redis.del(cacheKey);
      }
    }

    // 2. Check database
    console.log(`💾 Checking database for ${region}`);
    const existingConditions = await prisma.surfCondition.findFirst({
      where: {
        date: new Date(date),
        region: region,
      },
      orderBy: { updatedAt: "desc" },
    });

    console.log(
      "2. Found existing conditions:",
      JSON.stringify(existingConditions, null, 2)
    );

    if (existingConditions?.forecast) {
      console.log("✅ Using database entry for ${region}");
      const formattedData = formatConditionsResponse(existingConditions);
      console.log("3. Formatted data:", JSON.stringify(formattedData, null, 2));
      await redis.set(cacheKey, JSON.stringify(formattedData), { ex: 3600 });
      return NextResponse.json(formattedData);
    }

    // 3. Scrape new data with lock protection
    const scrapeLockKey = `scrape-lock:${date}`; // One lock per day instead of per region
    const isLocked = await redis.get(scrapeLockKey);

    if (isLocked) {
      console.log(`🔒 Scraping locked, waiting for data...`);
      // Wait briefly and check DB again
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const recentData = await prisma.surfCondition.findFirst({
        where: {
          date: new Date(date),
          region: region,
        },
        orderBy: { updatedAt: "desc" },
      });

      if (recentData?.forecast) {
        return NextResponse.json(formatConditionsResponse(recentData));
      }

      return NextResponse.json(
        { error: "Data refresh in progress" },
        { status: 429 }
      );
    }

    // Set scrape lock
    await redis.set(scrapeLockKey, "1", { ex: 30 }); // 30 second lock

    try {
      console.log("4. No existing data, starting scrape");
      const scrapedData = await scrapeAllRegions();

      console.log("5. Scraped data:", JSON.stringify(scrapedData, null, 2));

      if (!scrapedData?.length) {
        throw new Error(`No data scraped`);
      }

      // Save conditions and ratings in one go
      for (const data of scrapedData) {
        // Save condition
        await prisma.surfCondition.create({
          data: {
            id: randomUUID(),
            date: new Date(date),
            region: data.region,
            forecast: {
              wind: {
                speed: data.windSpeed,
                direction: data.windDirection,
              },
              swell: {
                height: data.swellHeight,
                period: data.swellPeriod,
                direction: data.swellDirection,
              },
            },
            updatedAt: new Date(),
          },
        });

        // Store ratings immediately after storing conditions
        const formattedData = {
          region: data.region,
          wind: {
            speed: data.windSpeed,
            direction: data.windDirection,
          },
          swell: {
            height: data.swellHeight,
            period: data.swellPeriod,
            direction: data.swellDirection,
          },
        };

        await storeGoodBeachRatings(formattedData, data.region, new Date(date));
      }

      // Find and return requested region's data
      const requestedRegionData = scrapedData.find(
        (data) => data.region === region
      );

      if (!requestedRegionData) {
        throw new Error(`No data found for ${region} in scrape results`);
      }

      const formattedData: WindData = {
        region: requestedRegionData.region,
        wind: {
          speed: Number(requestedRegionData.windSpeed),
          direction: requestedRegionData.windDirection,
        },
        swell: {
          height: Number(requestedRegionData.swellHeight),
          period: Number(requestedRegionData.swellPeriod),
          direction: Number(requestedRegionData.swellDirection),
        },
      };

      // Cache the result
      await redis.set(cacheKey, JSON.stringify(formattedData), { ex: 3600 });

      // Add request deduplication
      const dedupeKey = `req-dedup:${region}:${date}`;
      const existingRequest = await redis.get(dedupeKey);
      if (existingRequest && typeof existingRequest === "string") {
        return NextResponse.json(JSON.parse(existingRequest));
      }
      await redis.set(dedupeKey, "processing", { ex: 2 });

      await redis.set(dedupeKey, JSON.stringify(formattedData), { ex: 30 });

      return NextResponse.json(formattedData);
    } finally {
      // Always clean up the lock
      await redis.del(scrapeLockKey);
    }
  } catch (error) {
    console.error(`🚨 Error processing ${region}:`, {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Failed to fetch conditions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
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
