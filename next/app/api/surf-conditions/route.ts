import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { prisma } from '@/app/lib/prisma'
import { randomUUID } from 'crypto'
import { degreesToCardinal } from '@/app/lib/surfUtils'

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

async function getLatestConditions(forceRefresh = false) {
  const today = getTodayDate();
  
  if (!forceRefresh) {
    const existingConditions = await prisma.surfCondition.findFirst({
      where: { date: today },
      orderBy: { timestamp: 'desc' }
    });

    if (existingConditions) {
      const ageInHours = (Date.now() - Number(existingConditions.timestamp)) / (1000 * 60 * 60);
      
      if (ageInHours < 12) {
        return {
          wind: {
            direction: existingConditions.windDirection,
            speed: existingConditions.windSpeed
          },
          swell: {
            height: existingConditions.swellHeight,
            direction: existingConditions.swellDirection,
            period: existingConditions.swellPeriod,
            cardinalDirection: degreesToCardinal(existingConditions.swellDirection)
          },
          timestamp: existingConditions.timestamp
        };
      }
    }
  }

  // If forcing refresh or no recent data, scrape new data
  console.log('🌐 Scraping fresh data...');
  const scrapedData = await scrapeData();
  
  // Save to database with regular timestamp
  await prisma.surfCondition.create({
    data: {
      id: randomUUID(),
      date: today,
      ...scrapedData,
      timestamp: Date.now()  // Regular timestamp
    }
  });

  return {
    wind: {
      direction: scrapedData.windDirection,
      speed: scrapedData.windSpeed
    },
    swell: {
      height: scrapedData.swellHeight,
      direction: scrapedData.swellDirection,
      period: scrapedData.swellPeriod,
      cardinalDirection: degreesToCardinal(scrapedData.swellDirection)
    },
    timestamp: scrapedData.timestamp
  };
}

async function scrapeData() {
  try {
    // Log the start of scraping
    console.log('Starting scrape from swell.co.za...');
    
    const response = await axios.get("https://swell.co.za/ct/simple");
    
    // Log the response status and type
    console.log('Scrape response:', {
      status: response.status,
      contentType: response.headers['content-type'],
      dataLength: response.data?.length
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Add logging for each scraped value
    const windDirection = $(
      'div[style="display:block; width: 49px; height:20px; line-height:20px;  text-align: center; float:left; vertical-align: middle; background-color: white; border: 0px solid orange; color: black;"]'
    )
      .first()
      .text()
      .trim() || 'N/A';
    console.log('Scraped wind direction:', windDirection);

    const windSpeed = parseFloat(
      $('div[style*="width: 20px"][style*="height:20px"][style*="background-color: rgb(255, 255, 255)"][style*="color: rgb(0, 0, 0)"]')
        .first()
        .text()
        .trim()
    ) || 0;

    // Wave height
    const waveHeight = parseFloat(
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
    const swellPeriod = parseFloat(
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
    const swellDirection = $('div[style*="width: 49px"][style*="height:20px"]')
      .filter((_, el) => $(el).text().includes('°'))
      .first()
      .text()
      .trim()
      .split('\n')
      .pop()
      ?.replace('°', '') || 'N/A';

    const scrapedData = {
      windDirection,
      windSpeed,
      swellHeight: waveHeight,
      swellDirection,
      swellPeriod,
      timestamp: Date.now()
    };

    console.log('Successfully scraped data:', scrapedData);
    return scrapedData;
    
  } catch (error) {
    // Enhanced error logging
    console.error('Scraping error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      headers: error.response?.headers,
      data: error.response?.data
    });
    
    throw new Error(`Failed to scrape data: ${error.message}`);
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    
    const conditions = await getLatestConditions(forceRefresh);
    
    // Convert all BigInt values to numbers before sending
    const serializedData = {
      wind: conditions.wind,
      swell: conditions.swell,
      timestamp: Number(conditions.timestamp)
    };

    return NextResponse.json({ data: serializedData });
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surf conditions' },
      { status: 500 }
    );
  }
}