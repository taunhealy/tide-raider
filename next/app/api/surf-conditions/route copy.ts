import { NextResponse } from 'next/server'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { db } from '@/db'
import { surfConditions } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import { degreesToCardinal } from '@/app/lib/surfUtils'

function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

function shouldRefreshData(timestamp: number) {
  const now = new Date();
  const lastUpdate = new Date(timestamp);
  
  // If it's past 3am today and the last update was before 3am today
  const refreshTime = new Date(now);
  refreshTime.setHours(3, 0, 0, 0);
  
  return now > refreshTime && lastUpdate < refreshTime;
}

async function scrapeData() {
  try {
    const response = await axios.get("https://swell.co.za/ct/simple")
    const html = response.data
    const $ = cheerio.load(html)

    // Wind direction and speed (working correctly)
    const windDirection = $(
      'div[style="display:block; width: 49px; height:20px; line-height:20px;  text-align: center; float:left; vertical-align: middle; background-color: white; border: 0px solid orange; color: black;"]'
    )
      .first()
      .text()
      .trim() || 'N/A';

    const windSpeed = parseFloat(
      $('div[style*="width: 20px"][style*="height:20px"][style*="background-color: rgb(255, 255, 255)"][style*="color: rgb(0, 0, 0)"]')
        .first()
        .text()
        .trim()
    ) || 0;

    // Wave height (working correctly)
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

    // Swell period (working correctly)
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

    // Updated swell direction parsing to only get the degree value
    const swellDirection = $('div[style*="width: 49px"][style*="height:20px"]')
      .filter((_, el) => $(el).text().includes('°'))
      .first()
      .text()
      .trim()
      .split('\n')
      .pop()  // Get the last part after newlines
      ?.replace('°', '') || 'N/A';

    const scrapedData = {
      windDirection,
      windSpeed,
      swellHeight: waveHeight,
      swellDirection,
      swellPeriod,
      timestamp: Date.now()
    };

    // Debug logging
    console.log('Wind Data:', { windDirection, windSpeed });
    console.log('Scraped data:', scrapedData);
    
    return scrapedData;
  } catch (error) {
    console.error('Error scraping data:', error);
    throw error;
  }
}

export async function GET() {
  try {
    console.log('🌐 Fetching fresh data from website...');
    const scrapedData = await scrapeData();

    // Looking at the website structure, let's parse the first time slot data
    const firstTimeSlot = {
      wind: {
        direction: scrapedData.windDirection || 'N/A',
        speed: scrapedData.windSpeed || 0
      },
      swell: {
        height: scrapedData.swellHeight || 0,
        direction: scrapedData.swellDirection || 'N/A',
        period: scrapedData.swellPeriod || 0,
        cardinalDirection: degreesToCardinal(scrapedData.swellDirection)
      },
      timestamp: Date.now()
    };

    return NextResponse.json({ data: firstTimeSlot });

  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch surf conditions' },
      { status: 500 }
    );
  }
}