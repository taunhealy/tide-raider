import type { Beach } from "@/app/types/beaches";
import type { WindData, WindDataProp } from "@/app/types/wind";
import { prisma } from "@/app/lib/prisma";
import { beachData } from "@/app/types/beaches";
import { randomUUID } from "crypto";

export const FREE_BEACH_LIMIT = 7;

interface ScoreDisplay {
  description: string;
  emoji: string;
  stars: string;
}

export function getScoreDisplay(score: number): ScoreDisplay {
  // Use floor instead of round to prevent 3.5 → 4
  const flooredScore = Math.floor(score);

  const getStars = (count: number) => "⭐".repeat(count);

  switch (flooredScore) {
    case 5:
      return {
        description: "Yeeeew!",
        emoji: "🤩🔥",
        stars: getStars(5),
      };
    case 4:
      return {
        description: "Surfs up?!",
        emoji: "🏄‍♂️",
        stars: getStars(4),
      };
    case 3:
      return {
        description: "Maybe, baby?",
        emoji: "👻",
        stars: getStars(3),
      };
    case 2:
      return {
        description: "Probably dog kak",
        emoji: "🐶💩",
        stars: getStars(2),
      };
    case 1:
      return {
        description: "Dog kak",
        emoji: "💩",
        stars: getStars(1),
      };
    case 0:
      return {
        description: "Horse kak",
        emoji: "🐎💩",
        stars: "",
      };
    default:
      return {
        description: "?",
        emoji: "🐎💩",
        stars: "",
      };
  }
}

export function isBeachSuitable(
  beach: Beach,
  conditions: WindDataProp
): { suitable: boolean; score: number } {
  if (!conditions?.wind?.direction || !conditions?.swell?.direction) {
    return { suitable: false, score: 0 };
  }

  let score = 10; // Start with perfect score

  // Check wind direction first
  if (!beach.optimalWindDirections.includes(conditions.wind.direction)) {
    score = Math.max(0, score - 4); // Wrong wind direction
  }

  // Check wind strength separately
  if (!beach.sheltered) {
    if (conditions.wind.speed > 35) {
      score = Math.max(0, score - 4); // Very strong winds
    } else if (conditions.wind.speed > 25) {
      score = Math.max(0, score - 3); // Strong winds
    } else if (conditions.wind.speed > 15) {
      score = Math.max(0, score - 2); // Moderate winds
    }
  }

  // Check wave size with significant penalties
  if (
    !(
      conditions.swell.height >= beach.swellSize.min &&
      conditions.swell.height <= beach.swellSize.max
    )
  ) {
    const heightDiff = Math.min(
      Math.abs(conditions.swell.height - beach.swellSize.min),
      Math.abs(conditions.swell.height - beach.swellSize.max)
    );
    if (heightDiff <= 0.5) {
      score = Math.max(0, score - 4); // Just outside range
    } else if (heightDiff <= 1) {
      score = Math.max(0, score - 6); // Significantly off
    } else {
      score = Math.max(0, score - 8); // Way too big/small
    }
  }

  // Check swell direction with graduated penalties
  const swellDeg = conditions.swell.direction;
  const minSwellDiff = Math.abs(swellDeg - beach.optimalSwellDirections.min);
  const maxSwellDiff = Math.abs(swellDeg - beach.optimalSwellDirections.max);
  const swellDirDiff = Math.min(minSwellDiff, maxSwellDiff);

  if (
    !(
      swellDeg >= beach.optimalSwellDirections.min &&
      swellDeg <= beach.optimalSwellDirections.max
    )
  ) {
    if (swellDirDiff <= 10) {
      score = Math.max(0, score - 2);
    } else if (swellDirDiff <= 20) {
      score = Math.max(0, score - 4);
    } else if (swellDirDiff <= 30) {
      score = Math.max(0, score - 6);
    } else {
      score = Math.max(0, score - 8);
    }
  }

  // Check swell period with graduated penalties
  const periodDiff = Math.min(
    Math.abs(conditions.swell.period - beach.idealSwellPeriod.min),
    Math.abs(conditions.swell.period - beach.idealSwellPeriod.max)
  );

  if (
    !(
      conditions.swell.period >= beach.idealSwellPeriod.min &&
      conditions.swell.period <= beach.idealSwellPeriod.max
    )
  ) {
    if (periodDiff <= 2) {
      score = Math.max(0, score - 2);
    } else if (periodDiff <= 4) {
      score = Math.max(0, score - 4);
    } else {
      score = Math.max(0, score - 6);
    }
  }

  // Normalize score to 5-point scale
  const normalizedScore = Math.min(
    5,
    Math.round((Math.max(0, score) / 10) * 5)
  );

  return {
    score: normalizedScore,
    suitable: normalizedScore >= 4, // Requires at least 4 stars to be considered suitable
  };
}

export function degreesToCardinal(degrees: number | null | string): string {
  if (degrees === null || degrees === undefined || degrees === "") return "N/A";

  const num = Number(degrees);
  if (isNaN(num)) return "N/A";

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
  const index = Math.round((num % 360) / 22.5) % 16;

  return directions[index];
}

export function getConditionReasons(
  beach: Beach,
  windData: WindData | null,
  isGoodConditions: boolean = false
) {
  // Add early return if windData or its required properties are missing
  if (!windData?.wind?.direction || !windData?.swell?.direction) {
    return {
      reasons: [],
      optimalConditions: [
        {
          text: `Optimal Wind: ${beach.optimalWindDirections.join(", ")}`,
          isMet: false,
        },
        {
          text: `Wind Speed: 0-25km/h`,
          isMet: false,
        },
        {
          text: `Optimal Swell Direction: ${beach.optimalSwellDirections.min}° - ${beach.optimalSwellDirections.max}°`,
          isMet: false,
        },
        {
          text: `Optimal Wave Size: ${beach.swellSize.min}m - ${beach.swellSize.max}m`,
          isMet: false,
        },
        {
          text: `Optimal Swell Period: ${beach.idealSwellPeriod.min}s - ${beach.idealSwellPeriod.max}s`,
          isMet: false,
        },
      ],
    };
  }

  const reasons = [];

  // Check wind direction
  const hasGoodWind = beach.optimalWindDirections.includes(
    windData.wind.direction
  );
  if (isGoodConditions ? hasGoodWind : !hasGoodWind) {
    reasons.push(
      isGoodConditions
        ? `Perfect wind direction (${windData.wind.direction})`
        : `Wind direction (${windData.wind.direction}) not optimal`
    );
  }

  // Check swell direction
  const swellDeg = windData.swell.direction;
  const minSwellDiff = Math.abs(swellDeg - beach.optimalSwellDirections.min);
  const maxSwellDiff = Math.abs(swellDeg - beach.optimalSwellDirections.max);
  const swellDirDiff = Math.min(minSwellDiff, maxSwellDiff);

  if (
    isGoodConditions
      ? swellDeg >= beach.optimalSwellDirections.min &&
        swellDeg <= beach.optimalSwellDirections.max
      : !(
          swellDeg >= beach.optimalSwellDirections.min &&
          swellDeg <= beach.optimalSwellDirections.max
        )
  ) {
    reasons.push(
      isGoodConditions
        ? `Great swell direction (${windData.swell.direction}°)`
        : `Swell direction (${windData.swell.direction}°) outside optimal range`
    );
  }

  // Check swell height
  const hasGoodSwellHeight =
    windData.swell.height >= beach.swellSize.min &&
    windData.swell.height <= beach.swellSize.max;

  if (isGoodConditions ? hasGoodSwellHeight : !hasGoodSwellHeight) {
    if (isGoodConditions) {
      reasons.push(`Perfect wave height (${windData.swell.height}m)`);
    } else {
      const issue =
        windData.swell.height < beach.swellSize.min ? "too small" : "too big";
      reasons.push(`Wave height (${windData.swell.height}m) ${issue}`);
    }
  }

  // Add optimal conditions section with status
  const optimalConditions = [
    {
      text: `Optimal Wind: ${beach.optimalWindDirections.join(", ")}`,
      isMet: hasGoodWind,
    },
    {
      text: `Wind Speed: 0-25km/h${windData.wind.speed > 25 && !beach.sheltered ? "" : ""}`,
      isMet: windData.wind.speed <= 25 || beach.sheltered,
    },
    {
      text: `Optimal Swell Direction: ${beach.optimalSwellDirections.min}° - ${beach.optimalSwellDirections.max}°`,
      isMet:
        swellDeg >= beach.optimalSwellDirections.min &&
        swellDeg <= beach.optimalSwellDirections.max,
    },
    {
      text: `Optimal Wave Size: ${beach.swellSize.min}m - ${beach.swellSize.max}m`,
      isMet: hasGoodSwellHeight,
    },
    {
      text: `Optimal Swell Period: ${beach.idealSwellPeriod.min}s - ${beach.idealSwellPeriod.max}s`,
      isMet:
        windData.swell.period >= beach.idealSwellPeriod.min &&
        windData.swell.period <= beach.idealSwellPeriod.max,
    },
  ];

  return {
    reasons,
    optimalConditions,
  };
}

export function getGatedBeaches(
  beaches: Beach[],
  windData: WindData | null,
  isSubscribed: boolean,
  hasActiveTrial: boolean
) {
  // Show all beaches for subscribed users or those in trial
  if (isSubscribed || hasActiveTrial) {
    return {
      visibleBeaches: beaches,
      lockedBeaches: [],
    };
  }

  // For non-subscribed users, show first N beaches
  return {
    visibleBeaches: beaches.slice(0, FREE_BEACH_LIMIT),
    lockedBeaches: beaches.slice(FREE_BEACH_LIMIT),
  };
}

export interface BeachCount {
  count: number;
  shouldDisplay: boolean;
}

export function getGoodBeachCount(
  beaches: Beach[],
  windData: WindData | null
): BeachCount {
  if (!windData) return { count: 0, shouldDisplay: false };

  const count = beaches.filter((beach) => {
    const { score } = isBeachSuitable(beach, windData);
    return score >= 4;
  }).length;

  return { count, shouldDisplay: count > 0 };
}

export function formatConditionsResponse(conditions: any) {
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
