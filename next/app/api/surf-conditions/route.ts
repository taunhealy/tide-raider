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
}

function getTodayDate() {
  const date = new Date();
  // Set to start of day in UTC
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function formatConditionsResponse(conditions: any) {
  // Add null check for conditions first
  if (!conditions) {
    return { entries: [] };
  }

  // Handle case where conditions is already formatted
  if (conditions.forecast?.entries) {
    return conditions.forecast;
  }

  // Handle scraped data format
  if (typeof conditions.windSpeed !== "undefined") {
    return {
      entries: [
        {
          wind: {
            speed: conditions.windSpeed,
            direction: conditions.windDirection
              ? degreesToCardinal(Number(conditions.windDirection))
              : "N/A",
          },
          swell: {
            height: conditions.swellHeight,
            period: conditions.swellPeriod,
            direction: conditions.swellDirection,
          },
          timestamp: conditions.timestamp,
        },
      ],
    };
  }

  // Return empty entries if no valid format is found
  return { entries: [] };
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
  console.log("Checking for conditions with date:", today);

  // First check if we have today's data
  if (!forceRefresh) {
    const conditions = await prisma.surfCondition.findFirst({
      where: {
        date: today,
        region: region,
      },
      orderBy: { updatedAt: "desc" },
    });

    console.log("Found existing conditions:", conditions);

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
  console.log("Scraped data:", scrapedData);

  // Store scraped data with nested forecast structure
  await prisma.surfCondition.createMany({
    data: scrapedData.map((regionData) => ({
      id: randomUUID(),
      date: getTodayDate(),
      region: regionData.region,
      forecast: {
        entries: [
          {
            wind: {
              speed: regionData.windSpeed,
              direction: regionData.windDirection,
            },
            swell: {
              height: regionData.swellHeight,
              period: regionData.swellPeriod,
              direction: regionData.swellDirection,
            },
            timestamp: Date.now(),
          },
        ],
      },
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
            entries: [
              {
                wind: {
                  speed: windSpeed,
                  direction: windDirection,
                },
                swell: {
                  height: waveHeight,
                  period: swellPeriod,
                  direction: swellDirection,
                },
                timestamp: Date.now(),
              },
            ],
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
  const forceRefresh = searchParams.get("forceRefresh") === "true";
  const dateParam = searchParams.get("date");

  try {
    const date = dateParam ? new Date(dateParam) : getTodayDate();

    // Check for existing data first
    const existingConditions = await prisma.surfCondition.findFirst({
      where: {
        date: date,
        region: region,
      },
      orderBy: { updatedAt: "desc" },
    });

    if (existingConditions && !forceRefresh) {
      return NextResponse.json(formatConditionsResponse(existingConditions));
    }

    console.log(
      "📊 Found conditions:",
      JSON.stringify(existingConditions, null, 2)
    );
    // Only scrape once
    const scrapedData = await scrapeAllRegions();

    // Use upsert to prevent duplicates
    for (const regionData of scrapedData) {
      await prisma.surfCondition.upsert({
        where: {
          // Add a unique constraint if you don't have one
          date_region: {
            date: date,
            region: regionData.region,
          },
        },
        update: {
          forecast: {
            entries: [
              {
                wind: {
                  speed: regionData.windSpeed,
                  direction: regionData.windDirection,
                },
                swell: {
                  height: regionData.swellHeight,
                  period: regionData.swellPeriod,
                  direction: regionData.swellDirection,
                },
                timestamp: Date.now(),
              },
            ],
          },
          updatedAt: new Date(),
        },
        create: {
          id: randomUUID(),
          date: date,
          region: regionData.region,
          forecast: {
            entries: [
              {
                wind: {
                  speed: regionData.windSpeed,
                  direction: regionData.windDirection,
                },
                swell: {
                  height: regionData.swellHeight,
                  period: regionData.swellPeriod,
                  direction: regionData.swellDirection,
                },
                timestamp: Date.now(),
              },
            ],
          },
          updatedAt: new Date(),
        },
      });
    }

    const requestedRegionData = scrapedData.find(
      (data) => data.region === region
    );

    if (!requestedRegionData) {
      return NextResponse.json(
        { error: `No data available for region: ${region}` },
        { status: 404 }
      );
    }

    return NextResponse.json(formatConditionsResponse(requestedRegionData));
  } catch (error) {
    console.error("Error in surf-conditions GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch conditions" },
      { status: 500 }
    );
  }
}

async function storeGoodBeachRatings(conditions: any, date: Date) {
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
