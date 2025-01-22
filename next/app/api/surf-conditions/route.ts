import { NextResponse } from "next/server";
import axios from "axios";
import * as cheerio from "cheerio";
import { prisma } from "@/app/lib/prisma";
import { randomUUID } from "crypto";
import { degreesToCardinal } from "@/app/lib/surfUtils";

function getTodayDate() {
  // Ensure consistent YYYY-MM-DD format
  const date = new Date();
  return date.toISOString().split("T")[0];
}

async function getLatestConditions(forceRefresh = false) {
  const today = getTodayDate();

  // First check database for today's data
  if (!forceRefresh) {
    const existingConditions = await prisma.surfCondition.findFirst({
      where: { date: today },
      orderBy: { timestamp: "desc" },
    });

    // If we have data from today, use it
    if (existingConditions) {
      return {
        wind: {
          direction: existingConditions.windDirection,
          speed: existingConditions.windSpeed,
        },
        swell: {
          height: existingConditions.swellHeight,
          direction: existingConditions.swellDirection,
          period: existingConditions.swellPeriod,
          cardinalDirection: degreesToCardinal(
            existingConditions.swellDirection
          ),
        },
        timestamp: existingConditions.timestamp,
      };
    }
  }

  // If no data for today or force refresh, scrape new data
  console.log("🌐 Scraping fresh data for new day...");
  const scrapedData = await scrapeData();

  // Save the new data
  await prisma.surfCondition.create({
    data: {
      id: randomUUID(),
      date: today,
      windDirection: scrapedData.windDirection,
      windSpeed: scrapedData.windSpeed,
      swellHeight: scrapedData.swellHeight,
      swellDirection: scrapedData.swellDirection,
      swellPeriod: scrapedData.swellPeriod,
      timestamp: Date.now(),
    },
  });

  return {
    wind: {
      direction: scrapedData.windDirection,
      speed: scrapedData.windSpeed,
    },
    swell: {
      height: scrapedData.swellHeight,
      direction: scrapedData.swellDirection,
      period: scrapedData.swellPeriod,
      cardinalDirection: degreesToCardinal(scrapedData.swellDirection),
    },
    timestamp: Date.now(),
  };
}

async function scrapeData() {
  try {
    // Log the start of scraping
    console.log("Starting scrape from swell.co.za...");

    const response = await axios.get("https://swell.co.za/ct/simple");

    // Log the response status and type
    console.log("Scrape response:", {
      status: response.status,
      contentType: response.headers["content-type"],
      dataLength: response.data?.length,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Add logging for each scraped value
    const windDirection =
      $(
        'div[style="display:block; width: 49px; height:20px; line-height:20px;  text-align: center; float:left; vertical-align: middle; background-color: white; border: 0px solid orange; color: black;"]'
      )
        .first()
        .text()
        .trim() || "N/A";
    console.log("Scraped wind direction:", windDirection);

    const windSpeed =
      parseFloat(
        $(
          'div[style*="width: 20px"][style*="height:20px"][style*="background-color: rgb(255, 255, 255)"][style*="color: rgb(0, 0, 0)"]'
        )
          .first()
          .text()
          .trim()
      ) || 0;

    // Wave height
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

    // Swell period
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

    // Swell direction
    const swellDirection =
      $('div[style*="width: 49px"][style*="height:20px"]')
        .filter((_, el) => $(el).text().includes("°"))
        .first()
        .text()
        .trim()
        .split("\n")
        .pop()
        ?.replace("°", "") || "N/A";

    const scrapedData = {
      windDirection,
      windSpeed,
      swellHeight: waveHeight,
      swellDirection,
      swellPeriod,
      timestamp: Date.now(),
    };

    console.log("Successfully scraped data:", scrapedData);
    return scrapedData;
  } catch (error) {
    // Enhanced error logging
    console.error("Scraping error details:", {
      message: (error as Error).message,
      status: (error as any).response?.status,
      statusText: (error as any).response?.statusText,
      headers: (error as any).response?.headers,
      data: (error as any).response?.data,
    });

    throw new Error(`Failed to scrape data`);
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  // If date is provided, fetch historical data
  if (date) {
    const conditions = await prisma.surfCondition.findFirst({
      where: { date },
      orderBy: { timestamp: "desc" },
    });

    if (!conditions) {
      return Response.json(
        { error: "No data available for this date" },
        { status: 404 }
      );
    }

    return Response.json({
      data: {
        wind: {
          direction: conditions.windDirection,
          speed: conditions.windSpeed,
        },
        swell: {
          height: conditions.swellHeight,
          direction: conditions.swellDirection,
          period: conditions.swellPeriod,
          cardinalDirection: degreesToCardinal(conditions.swellDirection),
        },
        timestamp: conditions.timestamp,
      },
    });
  }

  // If no date provided, check if we already have today's data
  const today = getTodayDate();
  const existingConditions = await prisma.surfCondition.findFirst({
    where: { date: today },
    orderBy: { timestamp: "desc" },
  });

  if (existingConditions) {
    return Response.json({
      data: {
        wind: {
          direction: existingConditions.windDirection,
          speed: existingConditions.windSpeed,
        },
        swell: {
          height: existingConditions.swellHeight,
          direction: existingConditions.swellDirection,
          period: existingConditions.swellPeriod,
          cardinalDirection: degreesToCardinal(
            existingConditions.swellDirection
          ),
        },
        timestamp: existingConditions.timestamp,
      },
    });
  }

  // Only scrape and create new entry if we don't have today's data
  const scrapedData = await scrapeData();

  await prisma.surfCondition.create({
    data: {
      id: randomUUID(),
      date: today,
      windDirection: scrapedData.windDirection,
      windSpeed: scrapedData.windSpeed,
      swellHeight: scrapedData.swellHeight,
      swellDirection: scrapedData.swellDirection,
      swellPeriod: scrapedData.swellPeriod,
      timestamp: Date.now(),
    },
  });

  return Response.json({
    data: {
      wind: {
        direction: scrapedData.windDirection,
        speed: scrapedData.windSpeed,
      },
      swell: {
        height: scrapedData.swellHeight,
        direction: scrapedData.swellDirection,
        period: scrapedData.swellPeriod,
        cardinalDirection: degreesToCardinal(scrapedData.swellDirection),
      },
      timestamp: Date.now(),
    },
  });
}
