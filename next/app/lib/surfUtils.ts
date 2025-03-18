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

const cardinalToDegreesMap: { [key: string]: number } = {
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

export function isBeachSuitable(
  beach: Beach,
  conditions: WindDataProp
): { suitable: boolean; score: number } {
  if (!conditions?.windDirection || !conditions?.swellDirection) {
    return { suitable: false, score: 0 };
  }

  let score = 10; // Start with perfect score

  // Convert wind direction from degrees to cardinal
  const windCardinal = degreesToCardinal(conditions.windDirection);

  // Smarter wind direction check
  if (!beach.optimalWindDirections.includes(windCardinal)) {
    // Convert both directions to degrees for comparison
    const currentDirDegrees = Number(conditions.windDirection);
    const isNeighboring = beach.optimalWindDirections.some((optimalDir) => {
      const optimalDegrees = cardinalToDegreesMap[optimalDir];
      if (currentDirDegrees === undefined || optimalDegrees === undefined)
        return false;

      // Calculate the smallest angle between the two directions
      const diff = Math.abs(currentDirDegrees - optimalDegrees);
      const angleDiff = Math.min(diff, 360 - diff);

      return angleDiff <= 45;
    });

    if (isNeighboring) {
      score = Math.max(0, score - 2);
    } else {
      score = Math.max(0, score - 4);
    }
  }

  // Check wind strength separately
  if (!beach.sheltered) {
    if (conditions.windSpeed > 35) {
      score = Math.max(0, score - 4);
    } else if (conditions.windSpeed > 25) {
      score = Math.max(0, score - 3);
    } else if (conditions.windSpeed > 15) {
      score = Math.max(0, score - 2);
    }
  }

  // Check wave size with significant penalties
  if (
    !(
      conditions.swellHeight >= beach.swellSize.min &&
      conditions.swellHeight <= beach.swellSize.max
    )
  ) {
    const heightDiff = Math.min(
      Math.abs(conditions.swellHeight - beach.swellSize.min),
      Math.abs(conditions.swellHeight - beach.swellSize.max)
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
  const swellDeg = conditions.swellDirection;
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
    Math.abs(conditions.swellPeriod - beach.idealSwellPeriod.min),
    Math.abs(conditions.swellPeriod - beach.idealSwellPeriod.max)
  );

  if (
    !(
      conditions.swellPeriod >= beach.idealSwellPeriod.min &&
      conditions.swellPeriod <= beach.idealSwellPeriod.max
    )
  ) {
    if (periodDiff <= 2) {
      score = Math.max(0, score - 2);
    } else if (periodDiff <= 4) {
      score = Math.max(0, score - 4);
    } else {
      score = Math.max(0, score - 6);
    }
  } else {
    // Add bonus points for exceptionally good swell periods
    // For periods in the upper half of the ideal range
    const midPoint =
      (beach.idealSwellPeriod.min + beach.idealSwellPeriod.max) / 2;
    if (conditions.swellPeriod > midPoint) {
      // Add up to 2 bonus points for excellent swell periods
      const bonusRatio =
        (conditions.swellPeriod - midPoint) /
        (beach.idealSwellPeriod.max - midPoint);
      const bonus = Math.min(2, Math.max(0, bonusRatio * 2));
      score = Math.min(10, score + bonus);
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
  if (!windData?.windDirection || !windData?.swellDirection) {
    return {
      reasons: [],
      optimalConditions: [
        {
          text: `Optimal Wind: ${beach.optimalWindDirections.join(", ")}`,
          isMet: false,
        },
        {
          text: `Wind Speed: 0-25kts`,
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
  const windCardinal = degreesToCardinal(windData.windDirection);
  const hasGoodWind = beach.optimalWindDirections.includes(windCardinal);
  if (isGoodConditions ? hasGoodWind : !hasGoodWind) {
    reasons.push(
      isGoodConditions
        ? `Perfect wind direction (${windData.windDirection})`
        : `Wind direction (${windData.windDirection}) not optimal`
    );
  }

  // Check swell direction
  const swellDeg = windData.swellDirection;
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
        ? `Great swell direction (${windData.swellDirection}°)`
        : `Swell direction (${windData.swellDirection}°) outside optimal range`
    );
  }

  // Check swell height
  const hasGoodSwellHeight =
    windData.swellHeight >= beach.swellSize.min &&
    windData.swellHeight <= beach.swellSize.max;

  if (isGoodConditions ? hasGoodSwellHeight : !hasGoodSwellHeight) {
    if (isGoodConditions) {
      reasons.push(`Perfect wave height (${windData.swellHeight}m)`);
    } else {
      const issue =
        windData.swellHeight < beach.swellSize.min ? "too small" : "too big";
      reasons.push(`Wave height (${windData.swellHeight}m) ${issue}`);
    }
  }

  // Add optimal conditions section with status
  const optimalConditions = [
    {
      text: `Optimal Wind: ${beach.optimalWindDirections.join(", ")}`,
      isMet: hasGoodWind,
    },
    {
      text: `Wind Speed: 0-25kts${windData.windSpeed > 25 && !beach.sheltered ? "" : ""}`,
      isMet: windData.windSpeed <= 25 || beach.sheltered,
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
        windData.swellPeriod >= beach.idealSwellPeriod.min &&
        windData.swellPeriod <= beach.idealSwellPeriod.max,
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
  hasActiveTrial: boolean,
  isBetaMode: boolean = false
) {
  // In Beta mode, show all beaches regardless of subscription status
  if (isBetaMode) {
    return {
      visibleBeaches: beaches,
      lockedBeaches: [],
    };
  }

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

export function isWindDirectionSimilar(
  windDirection: string,
  optimalDirections: string[]
): boolean {
  // Normalize the wind direction before comparison
  const normalizedWind = windDirection.trim().toUpperCase();
  const normalizedOptimal = optimalDirections.map((d) =>
    d.trim().toUpperCase()
  );

  return normalizedOptimal.some((optimal) => normalizedWind === optimal);
}
