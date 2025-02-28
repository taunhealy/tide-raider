import { Browser, Page, BrowserContext } from "playwright-core";
import { chromium as playwright } from "playwright-core";
import chromium from "@sparticuz/chromium";
import { WindData } from "../../types/wind";
import { USER_AGENTS } from "@/app/lib/constants/userAgents";
import { ProxyManager } from "../proxy/proxyManager";
import { ProxyConfig } from "../proxy/types";
import { createHash } from "crypto";

// Add at the top of the file
declare global {
  interface Window {
    __mousePos?: { x: number; y: number };
  }
}

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

// Enhanced fingerprint randomization
const generateFingerprint = () => {
  const noise = Math.random().toString(36).slice(2, 7);
  return createHash("sha256").update(noise).digest("hex").slice(0, 32);
};

// Randomized request intervals (2-45 seconds)
const randomizedDelay = (base: number = 2000, variance: number = 43000) =>
  new Promise((resolve) =>
    setTimeout(resolve, base + Math.random() * variance)
  );

// Enhanced browser configuration
const getBrowserArgs = () => {
  const args = [
    "--no-sandbox",
    "--disable-blink-features=AutomationControlled",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    `--font-render-hinting=${Math.random() > 0.5 ? "medium" : "none"}`,
    `--window-size=${1280 + Math.floor(Math.random() * 200)},${720 + Math.floor(Math.random() * 200)}`,
  ];

  if (Math.random() > 0.8) args.push("--disable-accelerated-2d-canvas");
  return args;
};

const proxyManager = new ProxyManager();

const getBrowserPath = () => {
  return process.env.PLAYWRIGHT_BROWSERS_PATH || "./playwright";
};

export async function scraperA(url: string, region: string): Promise<WindData> {
  console.log("\n=== Starting Playwright Scraper ===");
  console.log("URL:", url);
  console.log("Region:", region);

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let proxy: ProxyConfig | null = null;
  const startTime = Date.now();

  try {
    proxy = proxyManager.getProxyForRegion(region);
    console.log(`Using proxy: ${proxy.host}`);

    // Configure chromium for serverless
    chromium.setGraphicsMode = false;
    const executablePath = await chromium.executablePath();

    const launchOptions = {
      args: [
        ...chromium.args,
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--hide-scrollbars",
        "--mute-audio",
        "--no-sandbox",
        "--single-process",
        "--no-zygote",
      ],
      executablePath,
      headless: true,
      defaultViewport: {
        width: 1280,
        height: 720,
      },
    };

    if (proxy.isCloudflare) {
      launchOptions.args.push(`--proxy-server=https://${proxy.host}`);
    }

    browser = await playwright.launch(launchOptions);

    // Advanced context configuration with randomization
    context = await browser.newContext({
      userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      viewport: {
        width: 1280 + Math.floor(Math.random() * 100),
        height: 720 + Math.floor(Math.random() * 100),
      },
      locale: "en-US",
      timezoneId: "UTC",
    });

    // Anti-bot scripts
    await context.addInitScript(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      Object.defineProperty(navigator, "plugins", {
        get: () => [
          { name: "Chrome PDF Plugin" },
          { name: "Chrome PDF Viewer" },
          { name: "Native Client" },
        ],
      });
    });

    page = await context.newPage();

    // Resource blocking for performance
    await page.route("**/*", (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      if (["image", "media", "font"].includes(resourceType)) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait for table with randomized timeout
    await page.waitForSelector(".weathertable", {
      state: "visible",
      timeout: 15000,
    });
    console.log("✅ Found weather table");

    // Wait for data to populate
    await page.waitForTimeout(4000);

    // First decode and clean the HTML
    const cleanHtml = await page.evaluate(() => {
      const table = document.querySelector(".weathertable");
      if (!table) return null;

      const rows = Array.from(table.querySelectorAll(".weathertable__row")).map(
        (row) => {
          const time = row.querySelector(".data-time .value")?.textContent;
          const windSpeed = row.querySelector(
            ".cell-wind-3 .units-ws"
          )?.textContent;
          const windDir = row
            .querySelector(".cell-wind-2 .directionarrow")
            ?.getAttribute("title");
          const waveHeight = row.querySelector(
            ".cell-waves-2 .units-wh"
          )?.textContent;
          const wavePeriod = row.querySelector(
            ".cell-waves-2 .data-wavefreq"
          )?.textContent;
          const swellDir = row
            .querySelector(".cell-waves-1 .directionarrow")
            ?.getAttribute("title");

          return {
            time,
            windSpeed,
            windDir,
            waveHeight,
            wavePeriod,
            swellDir,
            date: "",
          };
        }
      );

      return rows;
    });

    if (!cleanHtml) {
      throw new Error("Failed to parse weather table");
    }

    // Create today at midnight UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let forecast: WindData | null = null;

    // Find first morning forecast
    cleanHtml.forEach((row) => {
      const timeStr = row.time?.toString() || "";
      const hour = parseInt(timeStr.replace("h", ""));

      if (hour >= 5 && hour <= 11) {
        forecast = {
          windSpeed: parseInt(row.windSpeed || "0"),
          windDirection: parseFloat(row.windDir?.replace("°", "") || "0"),
          swellHeight: parseFloat(row.waveHeight || "0"),
          swellPeriod: parseInt((row.wavePeriod || "0").replace(/\s+s$/, "")),
          swellDirection: parseFloat(row.swellDir?.replace("°", "") || "0"),
          date: today,
          region,
        };
        return;
      }
    });

    if (!forecast) {
      throw new Error("No morning forecast data found between 05h-11h");
    }

    proxyManager.reportProxySuccess(proxy.host, Date.now() - startTime);
    return forecast;
  } catch (error) {
    if (proxy) {
      proxyManager.reportProxyFailure(proxy.host);
    }
    console.error("\n❌ Error in Playwright scraper:", error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log("\n🔚 Browser closed");
    }
  }
}
