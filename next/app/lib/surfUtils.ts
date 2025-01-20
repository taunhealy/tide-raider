import type { Beach } from "@/app/types/beaches";
import type { WindData } from "@/app/types/wind";

export function getEmojiDescription(score: number) {
  switch (score) {
    case 4:
      return "Surfs up?!";
    case 3:
      return "Hmmmmmm, maybe?";
    case 2:
      return "Probably dog kak";
    case 1:
      return "Dog kak";
    default:
      return "Horse kak";
  }
}

export function isBeachSuitable(
  beach: Beach | undefined,
  windData: WindData | undefined
) {
  // Return default score if either parameter is undefined
  if (!beach || !windData) {
    return {
      score: 0,
      maxScore: 4,
      suitable: false,
    };
  }

  let score = 0;

  // Check wind direction compatibility with penalty
  if (beach.optimalWindDirections.includes(windData.wind.direction)) {
    score += 2;
  } else {
    score = Math.max(0, score - 0.5);
  }

  // Add penalty for strong winds unless beach is sheltered
  if (
    windData.wind.speed >= 15 &&
    windData.wind.speed > 25 &&
    !beach.sheltered
  ) {
    score = Math.max(0, score - 0.5);
  }

  // Check swell direction
  const swellDeg = parseInt(windData.swell.direction);
  const hasGoodSwellDirection =
    swellDeg >= beach.optimalSwellDirections.min &&
    swellDeg <= beach.optimalSwellDirections.max;

  if (hasGoodSwellDirection) {
    score += 2;
  } else {
    score = Math.max(0, score - 1.5); // Penalize wrong swell direction but don't go below 0
  }

  // Check swell height with harsh penalty for wrong size
  const hasGoodSwellHeight =
    windData.swell.height >= beach.swellSize.min &&
    windData.swell.height <= beach.swellSize.max;

  if (hasGoodSwellHeight) {
    score += 1;
  } else {
    score = Math.max(0, score - 3); // Apply -3 penalty for wrong wave size
  }

  // Check swell period with graduated scoring
  const periodDiff = Math.min(
    Math.abs(windData.swell.period - beach.idealSwellPeriod.min),
    Math.abs(windData.swell.period - beach.idealSwellPeriod.max)
  );

  if (
    windData.swell.period >= beach.idealSwellPeriod.min &&
    windData.swell.period <= beach.idealSwellPeriod.max
  ) {
    // Within optimal range - no penalty
  } else if (periodDiff <= 2) {
    // Just outside optimal range (within 2 seconds)
    score = Math.max(0, score - 1);
  } else if (periodDiff <= 4) {
    // Moderately outside optimal range (2-4 seconds)
    score = Math.max(0, score - 2);
  } else {
    // Significantly outside optimal range
    score = Math.max(0, score - 2);
  }

  return {
    score,
    maxScore: 4,
    suitable: score > 0,
  };
}

export function getScoreEmoji(score: number) {
  switch (score) {
    case 4:
      return "🏄‍♂️";
    case 3:
      return "🏄‍♂️";
    case 2:
      return "🐶💩";
    case 1:
      return "💩";
    default:
      return "🐎💩";
  }
}

export function degreesToCardinal(degrees: string | number): string {
  const deg = typeof degrees === "string" ? parseInt(degrees) : degrees;
  if (isNaN(deg)) return "N/A";

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
  const index = Math.round((deg % 360) / 22.5);
  return directions[index % 16];
}

export function getConditionReasons(
  beach: Beach,
  windData: WindData,
  isGoodConditions: boolean = false
) {
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
  const swellDeg = parseInt(windData.swell.direction);
  const hasGoodSwellDirection =
    swellDeg >= beach.optimalSwellDirections.min &&
    swellDeg <= beach.optimalSwellDirections.max;

  if (isGoodConditions ? hasGoodSwellDirection : !hasGoodSwellDirection) {
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
      text: `Wind Speed: 0-25km/h${windData.wind.speed > 25 && !beach.sheltered ? " (Current winds too strong)" : ""}`,
      isMet: windData.wind.speed <= 25 || beach.sheltered,
    },
    {
      text: `Optimal Swell Direction: ${beach.optimalSwellDirections.min}° - ${beach.optimalSwellDirections.max}°`,
      isMet: hasGoodSwellDirection,
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
  isSubscribed: boolean
) {
  // For non-subscribed users, show first 3 beaches as visible and rest as locked
  if (!isSubscribed) {
    return {
      visibleBeaches: beaches.slice(0, 3),
      lockedBeaches: beaches.slice(3),
    };
  }

  // Subscribed users get all beaches as visible, none locked
  return {
    visibleBeaches: beaches,
    lockedBeaches: [],
  };
}
