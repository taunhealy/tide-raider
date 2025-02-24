import { WindData } from "../../types/wind";
import { chromium, Browser, Page, BrowserContext } from "playwright";
import { degreesToCardinal } from "../forecastUtils";

//Scraper A is Surf-Forecast.com

const cardinalToDirection: { [key: string]: number } = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5,
};

export async function scraperA(url: string, region: string): Promise<WindData> {
  console.log("\n=== Starting Playwright Scraper ===");
  console.log("URL:", url);
  console.log("Region:", region);

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;

  try {
    browser = await chromium.launch({
      headless: false,
      args: ["--no-sandbox", "--disable-blink-features=AutomationControlled"],
    });

    context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      viewport: { width: 1920, height: 1080 },
    });

    // Add stealth scripts
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      Object.defineProperty(navigator, "plugins", {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    page = await context.newPage();

    // Only block non-essential resources
    await page.route("**/*", (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      if (
        ["image", "media", "font"].includes(resourceType) ||
        (resourceType === "script" && !request.url().includes("essential"))
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    console.log("\n🌐 Loading page...");
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 15000,
    });
    console.log("✅ Initial DOM loaded");

    // Wait for CSS to load
    await page.waitForLoadState("load", { timeout: 15000 });
    console.log("✅ Page resources loaded");

    // Wait for table with CSS loaded
    await page.waitForSelector(".weathertable", {
      state: "visible",
      timeout: 15000,
    });
    console.log("✅ Found weather table");

    // Wait for data to populate
    console.log("Waiting for data to load...");
    await page.waitForTimeout(4000);

    // Check data presence
    const dataCheck = await page.evaluate(() => {
      const rows = document.querySelectorAll(".weathertable__row");
      const times = document.querySelectorAll(".data-time .value");
      const winds = document.querySelectorAll(".cell-wind-3 .units-ws");
      return {
        rowCount: rows.length,
        timeCount: times.length,
        windCount: winds.length,
        sampleTime: times[0]?.getAttribute("data-value"),
        sampleWind: winds[0]?.getAttribute("data-value"),
      };
    });
    console.log("Data check:", dataCheck);

    if (dataCheck.rowCount < 5) {
      console.log("Not enough rows, waiting longer...");
      await page.waitForTimeout(3000);
    }

    // Stop additional loading
    await page.evaluate(() => window.stop());
    console.log("✅ Stopped additional loading");

    // First decode and clean the HTML
    const cleanHtml = await page.evaluate(() => {
      const decodeHtml = (html: string) => {
        return html
          .replace(/\\n/g, "")
          .replace(/\\"/g, '"')
          .replace(/\\/g, "")
          .replace(/\s+/g, " ")
          .trim();
      };

      const table = document.querySelector(".weathertable");
      if (!table) return null;

      const rows = Array.from(table.querySelectorAll(".weathertable__row")).map(
        (row) => {
          const data = {
            time: row.querySelector(".data-time .value")?.textContent,
            windSpeed: row.querySelector(".cell-wind-3 .units-ws")?.textContent,
            windDir: row
              .querySelector(".cell-wind-2 .directionarrow")
              ?.getAttribute("title"),
            waveHeight: row.querySelector(".cell-waves-2 .units-wh")
              ?.textContent,
            wavePeriod: row.querySelector(".cell-waves-2 .data-wavefreq")
              ?.textContent,
            swellDir: row
              .querySelector(".cell-waves-1 .directionarrow")
              ?.getAttribute("title"),
            date: "",
          };
          return data;
        }
      );

      return rows;
    });

    console.log("All cleaned HTML:", cleanHtml);

    // Create today at 8am local time
    const today = new Date();
    today.setUTCHours(8, 0, 0, 0);

    let forecast: WindData | null = null;
    cleanHtml?.forEach((row) => {
      if (row.time === "08h") {
        forecast = {
          windSpeed: parseInt(row.windSpeed),
          windDirection: row.windDir.replace("°", ""),
          swellHeight: parseFloat(row.waveHeight),
          swellPeriod: parseInt(row.wavePeriod.trim().replace(/\s+s$/, "")),
          swellDirection: parseFloat(row.swellDir?.replace("°", "") || "0"),
          date: today,
          region,
        };
      }
    });

    return forecast;
  } catch (error) {
    console.error("\n❌ Error in Playwright scraper:", error);
    if (page) {
      await page.screenshot({ path: "error.png" });
    }
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log("\n🔚 Browser closed");
    }
  }
}
