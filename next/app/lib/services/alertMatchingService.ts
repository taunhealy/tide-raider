import { AlertConfig } from "@/app/components/alerts/AlertConfiguration";

interface LogEntry {
  id: string;
  region: string;
  timestamp: string;
  windSpeed?: number;
  windDirection?: number;
  waveHeight?: number;
  wavePeriod?: number;
  temperature?: number;
  // Add other properties as needed
}

interface ForecastData {
  region: string;
  timestamp: string;
  windSpeed?: number;
  windDirection?: number;
  waveHeight?: number;
  wavePeriod?: number;
  temperature?: number;
  // Add other properties as needed
}

export interface AlertMatch {
  alertId: string;
  alertName: string;
  logId: string;
  region: string;
  timestamp: string;
  matchedProperties: {
    property: string;
    logValue: number;
    forecastValue: number;
    difference: number;
    withinRange: boolean;
  }[];
  allPropertiesMatched: boolean;
}

export async function checkLogAgainstForecasts(
  logEntry: LogEntry,
  alerts: AlertConfig[],
  getForecastForRegion: (
    region: string,
    timestamp: string
  ) => Promise<ForecastData | null>
): Promise<AlertMatch[]> {
  const matches: AlertMatch[] = [];

  // Only process active alerts for the same region
  const relevantAlerts = alerts.filter(
    (alert) => alert.active && alert.region === logEntry.region
  );

  if (relevantAlerts.length === 0) return matches;

  // Get forecast data for the log's region and time
  const forecastData = await getForecastForRegion(
    logEntry.region,
    logEntry.timestamp
  );
  if (!forecastData) return matches;

  // Check each alert against the log and forecast
  for (const alert of relevantAlerts) {
    const matchedProperties: AlertMatch["matchedProperties"] = [];
    let allMatched = true;

    for (const propConfig of alert.properties) {
      const propertyName = propConfig.property;
      const logValue = logEntry[propertyName as keyof LogEntry] as
        | number
        | undefined;
      const forecastValue = forecastData[propertyName as keyof ForecastData] as
        | number
        | undefined;

      // Skip if either value is missing
      if (logValue === undefined || forecastValue === undefined) {
        allMatched = false;
        continue;
      }

      // Calculate difference and check if within range
      let difference: number;
      let withinRange: boolean;

      // Special handling for wind direction (circular)
      if (propertyName === "windDirection") {
        difference = Math.min(
          Math.abs(logValue - forecastValue),
          360 - Math.abs(logValue - forecastValue)
        );
        // Convert range percentage to degrees (out of 360)
        const rangeDegrees = (propConfig.range / 100) * 360;
        withinRange = difference <= rangeDegrees;
      } else {
        // For other properties, calculate percentage difference
        const percentDifference =
          Math.abs((logValue - forecastValue) / forecastValue) * 100;
        difference = percentDifference;
        withinRange = percentDifference <= propConfig.range;
      }

      matchedProperties.push({
        property: propertyName,
        logValue,
        forecastValue,
        difference,
        withinRange,
      });

      if (!withinRange) {
        allMatched = false;
      }
    }

    // If all properties matched within their ranges, add to matches
    if (allMatched && matchedProperties.length > 0) {
      matches.push({
        alertId: alert.id!,
        alertName: alert.name,
        logId: logEntry.id,
        region: logEntry.region,
        timestamp: logEntry.timestamp,
        matchedProperties,
        allPropertiesMatched: true,
      });
    }
  }

  return matches;
}
