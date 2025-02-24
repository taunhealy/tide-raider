import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import {} from "@/app/lib/surfUtils";

import { redis } from "@/app/lib/redis";
import { VALID_REGIONS, ValidRegion } from "@/app/lib/constants";
import { storeGoodBeachRatings } from "@/app/lib/beachRatings";
import { WindData } from "@/app/types/wind";
import { REGION_CONFIGS } from "@/lib/scrapers/scrapeSources";
import { scraperA } from "@/app/lib/scrapers/scraperA";
import { Prisma } from "@prisma/client";

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

// Add validation function
function isValidRegion(region: string): region is ValidRegion {
  return VALID_REGIONS.includes(region as ValidRegion);
}

function degreesToCardinal(degrees: number): string {
  const directions = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  const index = Math.round((parseFloat(degrees) % 360) / 22.5);
  return directions[index % 16];
}

async function getLatestConditions(
  forceRefresh = false,
  region: ValidRegion = "Western Cape"
) {
  console.log("=== getLatestConditions ===");

  // 1. Check database first
  const existingForecast = await prisma.forecastA.findFirst({
    where: {
      region: region,
      date: new Date(new Date().setHours(8, 0, 0, 0)), // Today at 8am
    },
  });

  if (existingForecast && !forceRefresh) {
    // Convert wind direction to cardinal for existing data
    return {
      ...existingForecast,
      windDirection: degreesToCardinal(
        parseFloat(existingForecast.windDirection)
      ),
    };
  }

  // 2. If no data exists or force refresh, scrape and store
  const regionConfig = REGION_CONFIGS.find(
    (config) => config.region === region
  );
  if (!regionConfig) throw new Error("Invalid region");

  const forecast = await scraperA(regionConfig.sourceA.url, region);

  // Store raw degrees in DB
  const storedForecast = await prisma.forecastA.upsert({
    where: {
      date_region: {
        date: forecast.date,
        region: forecast.region,
      },
    },
    update: {
      windSpeed: forecast.windSpeed,
      windDirection: forecast.windDirection,
      swellHeight: forecast.swellHeight,
      swellPeriod: forecast.swellPeriod,
      swellDirection: forecast.swellDirection,
    },
    create: {
      id: randomUUID(),
      ...forecast,
    },
  });

  // Return with cardinal direction
  return {
    ...storedForecast,
    windDirection: degreesToCardinal(parseFloat(storedForecast.windDirection)),
  };
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

export const dynamic = "force-dynamic";

async function getExistingForecast(
  source: "A" | "B",
  region: string,
  date: Date
) {
  const model = (source === "A" ? prisma.forecastA : prisma.forecastB) as any;

  return model.findFirst({
    where: {
      date: date,
      region: region,
    },
  });
}

async function storeForecast(source: "A" | "B", data: WindData) {
  const model = (source === "A" ? prisma.forecastA : prisma.forecastB) as any;

  return model.create({
    data: {
      id: randomUUID(),
      date: getTodayDate(),
      region: data.region,
      windSpeed: data.windSpeed,
      windDirection: data.windDirection,
      swellHeight: data.swellHeight,
      swellPeriod: data.swellPeriod,
      swellDirection: data.swellDirection,
    },
  });
}

async function getForecastsForRegion(region: ValidRegion) {
  const regionConfig = REGION_CONFIGS.find(
    (config) => config.region === region
  );
  if (!regionConfig) throw new Error("Invalid region");

  const response = await fetch(regionConfig.sourceA.url);
  const html = await response.text();
  return await scraperA(html, region);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = (searchParams.get("region") as ValidRegion) || "Western Cape";

  console.log("=== Starting GET request ===");
  console.log("Region:", region);

  try {
    const conditions = await getLatestConditions(false, region);
    console.log("Returning conditions:", conditions);
    return NextResponse.json(conditions);
  } catch (error) {
    console.error("Detailed error in GET route:", error);
    return NextResponse.json({ status: 500 });
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
