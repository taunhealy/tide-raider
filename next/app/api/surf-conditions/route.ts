import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import { degreesToCardinal, isBeachSuitable } from "@/app/lib/surfUtils";

import { redis } from "@/app/lib/redis";
import { beachData } from "@/app/types/beaches";
import { VALID_REGIONS, ValidRegion } from "@/app/lib/constants";

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
  swellDirection: string;
  swellPeriod: number;
  timestamp: number;
}

function getTodayDate() {
  const date = new Date();
  return date.toISOString().split("T")[0];
}

function formatConditionsResponse(conditions: any) {
  return {
    wind: {
      direction: conditions.windDirection,
      speed: conditions.windSpeed,
    },
    swell: {
      height: conditions.swellHeight,
      direction: conditions.swellDirection,
      period: conditions.swellPeriod,
      cardinalDirection: degreesToCardinal(Number(conditions.swellDirection)),
    },
    timestamp: conditions.timestamp,
    region: conditions.region,
  };
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
          `Starting scrape for ${config.region} from ${config.url}... (${retries} retries left)`
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

        const swellDirection =
          $('div[style*="width: 49px"][style*="height:20px"]')
            .filter((_, el) => $(el).text().includes("°"))
            .first()
            .text()
            .trim()
            .split("\n")
            .pop()
            ?.replace("°", "") || "N/A";

        results.push({
          region: config.region,
          windDirection,
          windSpeed,
          swellHeight: waveHeight,
          swellDirection,
          swellPeriod,
          timestamp: Date.now(),
        });

        console.log(
          `Successfully scraped data for ${config.region}:`,
          results[results.length - 1]
        );

        break; // Success, exit retry loop
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

  // First check if we have today's data for the requested region (usually Western Cape initially)
  if (!forceRefresh) {
    const conditions = await prisma.surfCondition.findFirst({
      where: {
        date: today,
        region: region,
      },
      orderBy: { timestamp: "desc" },
    });

    if (conditions) {
      // After returning Western Cape data, trigger background fetch for other regions
      if (region === "Western Cape") {
        backgroundFetchOtherRegions(today).catch(console.error);
      }
      return formatConditionsResponse(conditions);
    }
  }

  // If no data exists, fetch Western Cape first
  console.log("🌐 Scraping fresh data for", region);
  const scrapedData = await scrapeAllRegions();

  // Store all scraped data
  await prisma.surfCondition.createMany({
    data: scrapedData.map((regionData) => ({
      id: randomUUID(),
      date: today,
      region: regionData.region,
      windDirection: regionData.windDirection,
      windSpeed: regionData.windSpeed,
      swellHeight: regionData.swellHeight,
      swellDirection: regionData.swellDirection,
      swellPeriod: regionData.swellPeriod,
      timestamp: Date.now(),
    })),
  });

  // Store good beach ratings for each region's conditions
  for (const conditions of scrapedData) {
    await storeGoodBeachRatings(conditions, today);
  }

  const requestedRegionData = scrapedData.find(
    (data) => data.region === region
  );
  if (!requestedRegionData) {
    throw new Error(`No data available for region: ${region}`);
  }

  return formatConditionsResponse(requestedRegionData);
}

// New helper function to fetch other regions in the background
async function backgroundFetchOtherRegions(today: string) {
  // Check which regions we already have data for
  const existingRegions = await prisma.surfCondition.findMany({
    where: {
      date: today,
    },
    select: {
      region: true,
    },
  });

  const existingRegionNames = existingRegions.map((r) => r.region);

  // Find regions we need to fetch
  const regionsToFetch = REGION_CONFIGS.filter(
    (config) => !existingRegionNames.includes(config.region)
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

      const swellDirection =
        $('div[style*="width: 49px"][style*="height:20px"]')
          .filter((_, el) => $(el).text().includes("°"))
          .first()
          .text()
          .trim()
          .split("\n")
          .pop()
          ?.replace("°", "") || "N/A";

      await prisma.surfCondition.create({
        data: {
          id: randomUUID(),
          date: today,
          region: config.region,
          windDirection,
          windSpeed: windSpeed,
          swellHeight: waveHeight,
          swellDirection,
          swellPeriod,
          timestamp: Date.now(),
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get("region") || "Western Cape";

    // Validate region immediately
    if (!isValidRegion(region)) {
      return NextResponse.json(
        {
          error: "Unsupported region",
          message: `Surf forecasts are not yet available for ${region}. Valid regions are: ${VALID_REGIONS.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const date = searchParams.get("date") || getTodayDate();

    // Continue with cache/DB checks only for valid regions
    console.log("🔍 Checking cache/DB for:", { region, date });

    // Use more specific cache keys
    const cacheKey = `surf_conditions:${region}:${date}:v1`;
    const scrapeLockKey = `scrape_lock:${date}:v1`;

    // Try cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData && typeof cachedData === "string") {
      console.log("📦 Cache hit for:", { region, date });
      return NextResponse.json(JSON.parse(cachedData));
    }
    console.log("❌ Cache miss for:", { region, date });

    // Check database before scraping
    const conditions = await prisma.surfCondition.findFirst({
      where: {
        date: date,
        region: region,
      },
      orderBy: { timestamp: "desc" },
    });

    if (conditions) {
      console.log("💾 DB hit for:", { region, date });
      const formattedData = formatConditionsResponse(conditions);
      // Store in cache
      await redis.setex(
        cacheKey,
        CACHE_TIMES.getRedisExpiry(),
        JSON.stringify(formattedData)
      );
      return NextResponse.json(formattedData);
    }
    console.log("❌ DB miss for:", { region, date });

    // Implement better lock handling
    const isLocked = await redis.get(scrapeLockKey);
    if (isLocked) {
      console.log("🔒 Scrape already in progress, waiting...");
      // Wait and retry a few times
      for (let i = 0; i < 3; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const recentConditions = await prisma.surfCondition.findFirst({
          where: {
            date: date,
            region: region,
          },
          orderBy: { timestamp: "desc" },
        });

        if (recentConditions) {
          const formattedData = formatConditionsResponse(recentConditions);
          await redis.setex(
            cacheKey,
            CACHE_TIMES.getRedisExpiry(),
            JSON.stringify(formattedData)
          );
          return NextResponse.json(formattedData);
        }
      }
    }

    // Set lock with proper expiry
    await redis.setex(scrapeLockKey, CACHE_TIMES.SCRAPE_LOCK, "1");

    // 4. Set scrape lock and fetch fresh data
    console.log("🌊 Scraping fresh data for all regions");

    const scrapedData = await scrapeAllRegions();

    if (scrapedData && scrapedData.length > 0) {
      // Store in database
      const formattedScrapedData = scrapedData.map((d) => ({
        ...d,
        id: randomUUID(),
        date: date,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await prisma.surfCondition.createMany({
        data: formattedScrapedData,
      });

      // Store good beach ratings for each region's conditions
      console.log("Scraped conditions:", formattedScrapedData);
      for (const conditions of formattedScrapedData) {
        console.log("Storing ratings for region:", conditions.region);
        await storeGoodBeachRatings(conditions, date);
      }

      // Find and format requested region's data
      const regionData = scrapedData.find((d) => d.region === region);
      if (regionData) {
        const formattedData = formatConditionsResponse(regionData);
        // Store in cache
        await redis.setex(
          cacheKey,
          CACHE_TIMES.getRedisExpiry(),
          JSON.stringify(formattedData)
        );
        return NextResponse.json(formattedData);
      }
    }

    return NextResponse.json(
      { error: `No forecast data available for ${region}` },
      { status: 404 }
    );
  } catch (error) {
    console.error("❌ Error in surf-conditions route:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch surf conditions",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}

async function storeGoodBeachRatings(conditions: any, date: string) {
  // Get beaches for this region
  const regionBeaches = beachData.filter(
    (beach) => beach.region === conditions.region
  );

  // Calculate scores and store good ones
  const goodBeaches = regionBeaches
    .map((beach) => {
      const { score } = isBeachSuitable(
        beach,
        formatConditionsResponse(conditions)
      );
      return { beach, score };
    })
    .filter(({ score }) => score >= 4);

  // Store in database
  if (goodBeaches.length > 0) {
    await prisma.beachGoodRating.createMany({
      data: goodBeaches.map(({ beach, score }) => ({
        date,
        beachId: beach.id,
        region: beach.region,
        score,
        conditions: conditions, // Store conditions that made it good
      })),
      skipDuplicates: true,
    });
  }
}
