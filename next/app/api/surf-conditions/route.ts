import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import { degreesToCardinal, isBeachSuitable } from "@/app/lib/surfUtils";

import { redis } from "@/app/lib/redis";
import { beachData, WindData } from "@/app/types/beaches";
import { VALID_REGIONS, ValidRegion } from "@/app/lib/constants";
import { isValidWindData } from "@/app/types/wind";
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
  swellDirection: string;
  swellPeriod: number;
}

function getTodayDate() {
  const date = new Date();
  // Set to start of day in UTC
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function formatConditionsResponse(conditions: any): WindData | null {
  console.log("🎯 Formatting conditions:", JSON.stringify(conditions, null, 2));

  if (!conditions?.forecast?.wind || !conditions?.forecast?.swell) {
    console.log("❌ Invalid conditions structure");
    return null;
  }

  const { wind, swell } = conditions.forecast;

  const formattedData = {
    wind: {
      speed: Number(wind.speed),
      direction: wind.direction,
    },
    swell: {
      height: Number(swell.height),
      period: Number(swell.period),
      direction: Number(swell.direction),
    },
    timestamp: Date.now(),
  };

  console.log("✅ Formatted data:", JSON.stringify(formattedData, null, 2));
  return formattedData;
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

        console.log("Raw wind direction:", windDirection); // Debug log

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
          windDirection: windDirection || "0",
          windSpeed,
          swellHeight: waveHeight,
          swellDirection: swellDirection,
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
    await storeGoodBeachRatings(existingConditions.forecast, region, today);
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
      date: today,
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
    await storeGoodBeachRatings(conditions.forecast, conditions.region, today);
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

  console.log(`🌊 Fetching conditions for ${region} on ${date}`);

  // Add region validation check
  const isValidRequestedRegion = REGION_CONFIGS.some(
    (config) => config.region === region
  );
  if (!isValidRequestedRegion) {
    console.log(`❌ Unsupported region requested: ${region}`);
    return NextResponse.json(
      { error: "Region not supported" },
      { status: 400 }
    );
  }

  try {
    // 1. Check Redis cache first
    const cacheKey = `surf-conditions:${region}:${date}`;
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData as string);
        console.log(`📦 Cache hit for ${region}:`, parsedData);
        return NextResponse.json(parsedData);
      } catch (error) {
        console.error(`❌ Error parsing cached data for ${region}:`, error);
        await redis.del(cacheKey); // Clear invalid cache
      }
    }

    console.log(`🔍 No cache found, checking database for ${region}`);

    // 2. Check database if not in cache
    const existingConditions = await prisma.surfCondition.findFirst({
      where: {
        date: new Date(date),
        region: region,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existingConditions?.forecast) {
      console.log(`💾 Found in database for ${region}`);
      const formattedData = formatConditionsResponse(existingConditions);

      if (formattedData) {
        // Cache the formatted data
        await redis.set(cacheKey, JSON.stringify(formattedData), {
          ex: 3600, // 1 hour
        });

        // Store good beach ratings asynchronously
        await storeGoodBeachRatings(
          existingConditions.forecast,
          existingConditions.region,
          new Date(date)
        );

        return NextResponse.json(formattedData);
      }
    }

    console.log(`🌐 No database entry, scraping fresh data for ${region}`);

    // 3. Scrape new data if not in database
    const scrapeLockKey = `scrape-lock:${region}`;
    const isLocked = await redis.get(scrapeLockKey);

    if (isLocked) {
      console.log(`🔒 Scraping already in progress for ${region}`);
      return NextResponse.json(null);
    }

    // Set scrape lock
    await redis.set(scrapeLockKey, "1", {
      ex: 60 * 10, // 10 minute lock
    });

    try {
      const scrapedData = await scrapeAllRegions();
      console.log(`📥 Scraped new data for ${region}`);

      if (scrapedData?.length) {
        // Store conditions
        await prisma.surfCondition.createMany({ data: scrapedData });

        // Store ratings - single call per region
        await Promise.all(
          scrapedData.map((regionData) =>
            storeGoodBeachRatings(
              regionData.forecast,
              regionData.region,
              new Date(date)
            )
          )
        );

        // Get the requested region's data
        const requestedRegionData = scrapedData.find(
          (data) => data.region === region
        );

        if (requestedRegionData) {
          const formattedData = formatConditionsResponse({
            forecast: {
              wind: {
                speed: requestedRegionData.windSpeed,
                direction: requestedRegionData.windDirection,
              },
              swell: {
                height: requestedRegionData.swellHeight,
                period: requestedRegionData.swellPeriod,
                direction: requestedRegionData.swellDirection,
              },
            },
          });

          if (formattedData) {
            // Cache the formatted data
            await redis.set(cacheKey, JSON.stringify(formattedData), {
              ex: 3600,
            });

            return NextResponse.json(formattedData);
          }
        }
      }
    } finally {
      // Clean up scrape lock
      await redis.del(scrapeLockKey);
    }

    console.log(`❌ No data available for ${region}`);
    return NextResponse.json(null);
  } catch (error) {
    console.error(`🚨 Error fetching ${region}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch conditions" },
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
      await storeGoodBeachRatings(conditions.forecast, region, date);
    }
  } catch (error) {
    console.error("Rating ensure check failed:", error);
  }
}

async function storeGoodBeachRatingsNow(conditions: any, date: Date) {
  try {
    console.log(`📊 Starting rating calculation for ${conditions.region}...`);

    const regionBeaches = beachData.filter(
      (beach) => beach.region === conditions.region
    );
    console.log(
      `Found ${regionBeaches.length} beaches in ${conditions.region}`
    );

    const goodBeaches = regionBeaches
      .map((beach) => {
        const { score, isSuitable } = isBeachSuitable(
          beach,
          conditions.forecast
        );
        console.log(
          `${beach.name}: Score ${score}/5 (${isSuitable ? "✅" : "❌"})`
        );
        return { beach, score };
      })
      .filter(({ score }) => score >= 4);

    console.log(`Found ${goodBeaches.length} good beaches with score >= 4`);

    if (goodBeaches.length > 0) {
      const ratingData = goodBeaches.map(({ beach, score }) => ({
        id: randomUUID(),
        date,
        beachId: beach.id,
        region: beach.region,
        score,
        conditions: conditions.forecast,
      }));

      console.log(
        "Attempting to store ratings:",
        JSON.stringify(ratingData, null, 2)
      );

      await prisma.beachGoodRating.createMany({
        data: ratingData,
        skipDuplicates: true,
      });

      console.log(
        `✅ Successfully stored ${goodBeaches.length} ratings for ${conditions.region}`
      );
    } else {
      console.log(
        `ℹ️ No beaches met the rating threshold for ${conditions.region}`
      );
    }
  } catch (error) {
    console.error("❌ Rating regeneration error:", error);
    // Log the full error details
    if (error instanceof Error) {
      console.error({
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
  }
}

async function storeGoodBeachRatingsAsync(conditions: any, date: Date) {
  // Keep original async behavior but use reliable version
  setTimeout(() => storeGoodBeachRatingsNow(conditions, date), 0);
}
