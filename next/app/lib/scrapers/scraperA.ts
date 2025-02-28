import { WindData } from "../../types/wind";
import { chromium, Browser, Page, BrowserContext } from "playwright";

import { createHash } from "crypto";
import { USER_AGENTS } from "@/app/lib/constants/userAgents";
import { ProxyManager } from "../proxy/proxyManager";
import { ProxyConfig } from "../proxy/types";

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

    const launchOptions: Parameters<typeof chromium.launch>[0] = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
      chromiumSandbox: false,
      executablePath: process.env.PLAYWRIGHT_BROWSERS_PATH
        ? `${process.env.PLAYWRIGHT_BROWSERS_PATH}/chromium/chrome`
        : undefined,
    };

    if (proxy.isCloudflare) {
      launchOptions.proxy = {
        server: `https://${proxy.host}`,
      };
    }

    browser = await chromium.launch(launchOptions);

    // Advanced context configuration with randomization
    context = await browser.newContext({
      userAgent: USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
      viewport: {
        width: 1280 + Math.floor(Math.random() * 200),
        height: 720 + Math.floor(Math.random() * 200),
      },
      locale: "en-US",
      timezoneId: "UTC",
      deviceScaleFactor: Math.random() > 0.5 ? 1 : 2,
      hasTouch: Math.random() > 0.8,
    });

    // Anti-bot scripts
    await context.addInitScript(() => {
      // WebGL fingerprint randomization
      const getParameterProxy = (
        original: WebGLRenderingContext["getParameter"]
      ) => {
        return function (this: WebGLRenderingContext, parameter: number) {
          if (parameter === 37445) {
            return `ANGLE (${Math.random() > 0.5 ? "NVIDIA" : "Intel"}) Direct3D11`;
          }
          if (parameter === 37446) {
            return Math.random() > 0.5 ? "Google Inc." : "Intel Inc.";
          }
          return original.call(this, parameter);
        };
      };

      // Plugin and navigator spoofing
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      Object.defineProperty(navigator, "plugins", {
        get: () => [
          { name: "Chrome PDF Plugin" },
          { name: "Chrome PDF Viewer" },
          { name: "Native Client" },
        ],
      });

      // Canvas fingerprint randomization
      const originalGetContext = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        options?: CanvasRenderingContext2DSettings
      ) {
        const context = originalGetContext.call(this, type, options);
        if (context && type === "2d") {
          const ctx = context as CanvasRenderingContext2D;
          const originalFillText = ctx.fillText;
          ctx.fillText = function (
            this: CanvasRenderingContext2D,
            text: string,
            x: number,
            y: number,
            maxWidth?: number
          ) {
            ctx.shadowColor = `rgba(${Math.random()},${Math.random()},${Math.random()},0.01)`;
            return originalFillText.call(this, text, x, y, maxWidth);
          };
        }
        return context;
      } as typeof HTMLCanvasElement.prototype.getContext;
    });

    page = await context.newPage();

    // Resource blocking with randomization
    await page.route("**/*", (route) => {
      const request = route.request();
      const resourceType = request.resourceType();
      if (
        ["image", "media", "font"].includes(resourceType) ||
        (resourceType === "script" && Math.random() > 0.7)
      ) {
        route.abort();
      } else {
        route.continue();
      }
    });

    // Randomized navigation timing
    await page.goto(url, {
      waitUntil: Math.random() > 0.5 ? "domcontentloaded" : "load",
      timeout: 15000,
    });

    // Add random mouse movements
    await page.evaluate(() => {
      const moveCount = 3 + Math.floor(Math.random() * 5);
      for (let i = 0; i < moveCount; i++) {
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        const event = new MouseEvent("mousemove", {
          clientX: x,
          clientY: y,
          bubbles: true,
        });
        document.dispatchEvent(event);
      }
    });

    // Random scroll behavior
    await page.evaluate(() => {
      window.scrollTo({
        top: Math.random() * document.body.scrollHeight * 0.3,
        behavior: "smooth",
      });
    });

    // Wait for table with randomized timeout
    await page.waitForSelector(".weathertable", {
      state: "visible",
      timeout: 10000 + Math.floor(Math.random() * 5000),
    });

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

      // Try both table structures
      const table = document.querySelector(".weathertable");
      if (!table) return null;

      const rows = Array.from(table.querySelectorAll(".weathertable__row")).map(
        (row) => {
          // First try Surf-Forecast selectors
          let time = row.querySelector(".data-time .value")?.textContent;
          let windSpeed = row.querySelector(
            ".cell-wind-3 .units-ws"
          )?.textContent;
          let windDir = row
            .querySelector(".cell-wind-2 .directionarrow")
            ?.getAttribute("title");
          let waveHeight = row.querySelector(
            ".cell-waves-2 .units-wh"
          )?.textContent;
          let wavePeriod = row.querySelector(
            ".cell-waves-2 .data-wavefreq"
          )?.textContent;
          let swellDir = row
            .querySelector(".cell-waves-1 .directionarrow")
            ?.getAttribute("title");

          // If we didn't find the data, try Windfinder selectors
          if (!time || !windSpeed) {
            time = row
              .querySelector(".data-time .value")
              ?.getAttribute("data-value");
            windSpeed = row
              .querySelector(".cell-wind-3 .units-ws")
              ?.getAttribute("data-value");
            windDir = row
              .querySelector(".cell-wind-2 .directionarrow")
              ?.getAttribute("title");
            waveHeight = row
              .querySelector(".cell-waves-2 .units-wh")
              ?.getAttribute("data-value");
            wavePeriod = row
              .querySelector(".cell-waves-2 .data-wavefreq")
              ?.textContent?.trim();
            swellDir = row
              .querySelector(".cell-waves-1 .directionarrow")
              ?.getAttribute("title");
          }

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

    console.log("All cleaned HTML:", cleanHtml);

    // Create today at 8am local time
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let forecast: WindData | null = null;
    cleanHtml?.forEach((row) => {
      // Look for morning times between 05h-11h
      const timeStr = row.time?.toString() || "";
      const hour = parseInt(timeStr.replace("h", ""));

      if (hour >= 5 && hour <= 11) {
        console.log("Found morning time:", hour);

        forecast = {
          windSpeed: parseInt(row.windSpeed || "0"),
          windDirection: parseFloat(row.windDir?.replace("°", "") || "0"),
          swellHeight: parseFloat(row.waveHeight || "0"),
          swellPeriod: parseInt((row.wavePeriod || "0").replace(/\s+s$/, "")),
          swellDirection: parseFloat(row.swellDir?.replace("°", "") || "0"),
          date: today,
          region,
        };

        // Add debug logging
        console.log("Raw time:", timeStr);
        console.log("Parsed hour:", hour);
        console.log("Raw wind direction:", row.windDir);
        console.log("Parsed forecast:", forecast);

        // Break after finding first valid morning time
        return;
      }
    });

    if (!forecast) {
      throw new Error("No morning forecast data found between 05h-11h");
    }

    // Add random interaction delays
    await page.waitForSelector(".weathertable", {
      state: "visible",
      timeout: 15000,
    });
    await page.mouse.move(100 + Math.random() * 100, 200 + Math.random() * 50, {
      steps: 5 + Math.floor(Math.random() * 10),
    });

    proxyManager.reportProxySuccess(proxy.host, Date.now() - startTime);
    return forecast;
  } catch (error) {
    if (proxy) {
      proxyManager.reportProxyFailure(proxy.host);
    }
    // Enhanced error handling with retry logic
    if (Math.random() > 0.6 && context) {
      await context.clearCookies();
      await context.setExtraHTTPHeaders({
        "Accept-Language": `en-US;q=${0.8 + Math.random() * 0.2}`,
        "Sec-CH-UA": `"Chromium";v="${Math.floor(Math.random() * 5 + 118)}"`,
      });
    }
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
