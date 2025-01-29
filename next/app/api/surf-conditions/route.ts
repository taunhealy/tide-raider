import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import { degreesToCardinal, isBeachSuitable } from "@/app/lib/surfUtils";
import { Region } from "@/app/types/beaches";
import {
  getCachedSurfConditions,
  cacheSurfConditions,
  redis,
} from "@/app/lib/redis";
import { beachData } from "@/app/types/beaches";

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

async function scrapeAllRegions(): Promise<ScrapeResult[]> {
  const results: ScrapeResult[] = [];

  for (const config of REGION_CONFIGS) {
    try {
      console.log(`Starting scrape for ${config.region} from ${config.url}...`);

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
    } catch (error) {
      console.error(`Scraping error for ${config.region}:`, {
        message: (error as Error).message,
        status: (error as any).response?.status,
        statusText: (error as any).response?.statusText,
      });
    }
  }

  if (results.length === 0) {
    throw new Error("Failed to scrape data from all regions");
  }

  return results;
}

async function getLatestConditions(
  forceRefresh = false,
  region: string = "Western Cape"
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
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");
  const today = new Date().toISOString().split("T")[0];

  if (!region) {
    return NextResponse.json({ error: "Region is required" }, { status: 400 });
  }

  try {
    // 1. Check Redis cache first with detailed logging
    const cacheKey = `surf-conditions:${region}:${today}`;
    console.log(`🔍 Checking Redis cache for key: ${cacheKey}`);
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      console.log(`✅ Cache hit for ${cacheKey}`);
      return NextResponse.json(
        typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData
      );
    }
    console.log(`❌ Cache miss for ${cacheKey}`);

    // 2. Check database with better error handling
    console.log(`🔍 Checking database for ${today}'s data`);
    const existingData = await prisma.surfCondition
      .findFirst({
        where: { date: today },
      })
      .catch((error) => {
        console.error("Database query error:", error);
        return null;
      });

    // 3. If no data exists, scrape with better error handling
    if (!existingData) {
      console.log("🌊 No data for today - initiating scrape...");
      try {
        const scrapedData = await scrapeAllRegions();

        if (!scrapedData.length) {
          console.error("❌ Scraping returned no data");
          throw new Error("Scraping failed to return any data");
        }

        // Store scraped data with error handling
        await prisma.surfCondition
          .createMany({
            data: scrapedData.map((data) => ({
              id: randomUUID(),
              date: today,
              ...data,
            })),
          })
          .catch((error) => {
            console.error("Failed to store scraped data:", error);
            throw error;
          });

        // Calculate and cache beach counts
        const beachCounts: Record<string, number> = {};
        for (const data of scrapedData) {
          const formattedData = formatConditionsResponse(data);
          // Cache each region's conditions
          await redis
            .setex(
              `surf-conditions:${data.region}:${today}`,
              CACHE_TIMES.getRedisExpiry(),
              JSON.stringify(formattedData)
            )
            .catch((error) =>
              console.error(`Failed to cache ${data.region}:`, error)
            );

          // Calculate good beach count
          const regionBeaches = beachData.filter(
            (b) => b.region === data.region
          );
          const goodBeachCount = regionBeaches.filter((beach) => {
            const { score } = isBeachSuitable(beach, formattedData);
            return score >= 4;
          }).length;

          beachCounts[data.region] = goodBeachCount;
        }

        // Cache beach counts
        await redis
          .setex(
            `beach:counts:all`,
            CACHE_TIMES.getRedisExpiry(),
            JSON.stringify(beachCounts)
          )
          .catch((error) =>
            console.error("Failed to cache beach counts:", error)
          );

        const requestedData = scrapedData.find((d) => d.region === region);
        if (requestedData) {
          return NextResponse.json(formatConditionsResponse(requestedData));
        }
      } catch (scrapeError) {
        console.error("🚨 Scraping failed:", scrapeError);
        throw scrapeError;
      }
    }

    // 4. Return existing data for requested region
    const regionData = await prisma.surfCondition.findFirst({
      where: {
        date: today,
        region: region,
      },
      orderBy: { timestamp: "desc" },
    });

    if (regionData) {
      const formattedData = formatConditionsResponse(regionData);
      // Cache it while we have it
      await redis
        .setex(
          cacheKey,
          CACHE_TIMES.getRedisExpiry(),
          JSON.stringify(formattedData)
        )
        .catch((error) => console.error("Failed to cache region data:", error));

      return NextResponse.json(formattedData);
    }

    // 5. Return fallback data with warning log
    console.warn(`⚠️ No data available for ${region}, returning fallback data`);
    return NextResponse.json({
      wind: { direction: "N/A", speed: 0 },
      swell: {
        height: 0,
        period: 0,
        direction: "N/A",
        cardinalDirection: "N/A",
      },
      timestamp: Date.now(),
      region: region,
    });
  } catch (error: any) {
    console.error("🚨 Critical error in surf conditions API:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
