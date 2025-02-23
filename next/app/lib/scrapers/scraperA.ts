import { WindData } from "../../types/wind";
import cheerio from "cheerio";

export async function scraperA(
  html: string,
  region: string
): Promise<WindData> {
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

  const swellHeight =
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

  const swellDirection = parseInt(
    $('div[style*="width: 49px"]')
      .filter((_, el) => $(el).text().includes("°"))
      .first()
      .text()
      .trim()
      .split("\n")
      .pop()
      ?.replace("°", "") || "0",
    10
  );

  return {
    region,
    wind: {
      speed: windSpeed,
      direction: windDirection,
    },
    swell: {
      height: swellHeight,
      period: swellPeriod,
      direction: swellDirection,
    },
  };
}
