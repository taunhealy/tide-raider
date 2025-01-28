import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import { degreesToCardinal } from "@/app/lib/surfUtils";
import { Region } from "@/app/types/beaches";
import {
  getCachedSurfConditions,
  cacheSurfConditions,
  redis,
} from "@/app/lib/redis";

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

  console.log(`Fetching conditions for region: ${region}, date: ${today}`);

  if (!region) {
    return NextResponse.json({ error: "Region is required" }, { status: 400 });
  }

  const cacheKey = `surf-conditions:${region}:${today}`;

  try {
    // 1. Try Redis cache first
    let data;
    try {
      const cachedData = await redis.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for ${region} on ${today}`);
        data =
          typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;
      }
    } catch (redisError) {
      console.log("Redis unavailable, falling back to database:", redisError);
    }

    // 2. If no cache, check database
    if (!data) {
      const dbData = await prisma.surfCondition.findFirst({
        where: {
          date: today,
          region: region,
        },
        orderBy: { timestamp: "desc" },
      });

      if (dbData) {
        data = formatConditionsResponse(dbData);
        // Try to cache the data
        try {
          await redis.setex(
            cacheKey,
            CACHE_TIMES.getRedisExpiry(),
            JSON.stringify(data)
          );
        } catch (redisCacheError) {
          console.log("Failed to cache in Redis (non-fatal):", redisCacheError);
        }
      }
    }

    // 3. If no data in cache or DB, scrape new data
    if (!data) {
      console.log(`No cached data for ${region}, attempting to scrape...`);
      const scrapedData = await scrapeAllRegions();

      // Store all scraped data in DB
      await prisma.surfCondition.createMany({
        data: scrapedData.map((regionData) => ({
          id: randomUUID(),
          date: today,
          ...regionData,
        })),
      });

      const regionData = scrapedData.find((d) => d.region === region);
      if (!regionData) {
        throw new Error(`No data available for region: ${region}`);
      }

      data = formatConditionsResponse(regionData);

      // Try to cache the new data
      try {
        await redis.setex(
          cacheKey,
          CACHE_TIMES.getRedisExpiry(),
          JSON.stringify(data)
        );
      } catch (redisCacheError) {
        console.log("Failed to cache in Redis (non-fatal):", redisCacheError);
      }
    }

    // 4. Return the data with proper formatting
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching surf conditions:", error);

    // Return a properly formatted error response
    return NextResponse.json(
      {
        error: "Failed to fetch surf conditions",
        wind: {
          direction: "N/A",
          speed: 0,
        },
        swell: {
          height: 0,
          period: 0,
          direction: "N/A",
          cardinalDirection: "N/A",
        },
        timestamp: Date.now(),
      },
      { status: 500 }
    );
  }
}
