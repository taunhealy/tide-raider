import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import { degreesToCardinal } from "@/app/lib/surfUtils";
import { Region } from "@/app/types/beaches";

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

async function getLatestConditions(forceRefresh = false, region?: string) {
  const today = getTodayDate();

  if (!forceRefresh) {
    // Try to get conditions for requested region
    const existingConditions = await prisma.surfCondition.findFirst({
      where: {
        date: today,
        region: region,
      },
      orderBy: { timestamp: "desc" },
    });

    if (existingConditions) {
      return formatConditionsResponse(existingConditions);
    }

    // If no conditions found for requested region, try Northern Cape as fallback
    if (region && region !== "Northern Cape") {
      const fallbackConditions = await prisma.surfCondition.findFirst({
        where: {
          date: today,
          region: "Northern Cape",
        },
        orderBy: { timestamp: "desc" },
      });

      if (fallbackConditions) {
        return formatConditionsResponse(fallbackConditions);
      }
    }
  }

  console.log("🌐 Scraping fresh data for new day...");
  const scrapedData = await scrapeAllRegions();

  for (const regionData of scrapedData) {
    await prisma.surfCondition.create({
      data: {
        id: randomUUID(),
        date: today,
        region: regionData.region,
        windDirection: regionData.windDirection,
        windSpeed: regionData.windSpeed,
        swellHeight: regionData.swellHeight,
        swellDirection: regionData.swellDirection,
        swellPeriod: regionData.swellPeriod,
        timestamp: Date.now(),
      },
    });
  }

  // Try to get requested region data first, fallback to Northern Cape
  const requestedRegionData = scrapedData.find(
    (data) => data.region === region
  ) || scrapedData.find((data) => data.region === "Northern Cape");

  if (!requestedRegionData) {
    throw new Error(`No data available for region: ${region} or fallback`);
  }

  return formatConditionsResponse(requestedRegionData);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const region = searchParams.get("region");

  console.log("Fetching conditions for region:", region); // Debug log

  try {
    const conditions = await getLatestConditions(false, region || undefined);
    console.log("Fetched conditions:", conditions); // Debug log
    return Response.json(conditions);
  } catch (error) {
    console.error("Error fetching conditions:", error);
    return Response.json(
      { error: "Failed to fetch conditions" },
      { status: 500 }
    );
  }
}
