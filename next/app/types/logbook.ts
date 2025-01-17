import React from "react";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";

export interface Beach {
  id: string;
  name: string;
  region: string;
  continent: string;
  country: string;
  waveType: string;
  location: string;
}

export interface LogEntry {
  id: string;
  date: string;
  surferName: string;
  beachName: string;
  surferRating: number;
  comments: string;
  isAnonymous: boolean;
  beach?: {
    continent: string;
    country: string;
    region: string;
    waveType: string;
  };
  forecast?: {
    wind: {
      direction: string;
      speed: number;
    };
    swell: {
      height: number;
      direction: string;
      period: number;
      cardinalDirection: string;
    };
    timestamp: number;
  };
  location?: {
    country: string;
    region: string;
  };
  windSpeed?: number;
  windDirection?: number;
  swellHeight?: number;
  swellDirection?: number;
}

export interface CreateLogEntryInput {
  date: string;
  surferName: string;
  beachName: string;
  surferRating: number;
  comments: string;
  beach: {
    continent: string;
    country: string;
    region: string;
    waveType: string;
  };
  forecast?: LogEntry["forecast"];
}

export interface SortConfig {
  field: keyof LogEntry;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  beachName?: string;
  surferName?: string;
  minRating?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface LogbookTableColumn {
  key: keyof LogEntry | "forecastSummary";
  label: string;
  sortable?: boolean;
  render?: (entry: LogEntry) => React.ReactNode;
}

export const DEFAULT_COLUMNS: LogbookTableColumn[] = [
  { key: "date", label: "Date", sortable: true },
  { key: "beachName", label: "Beach", sortable: true },
  { key: "surferName", label: "Logger", sortable: true },
  { key: "surferRating", label: "Rating", sortable: true },
  {
    key: "forecastSummary",
    label: "Conditions",
    render: (entry: LogEntry) =>
      entry.forecast
        ? `${entry.forecast.swell.height}m ${getSwellEmoji(entry.forecast.swell.height)} | ${getWindEmoji(entry.forecast.wind.speed)} ${entry.forecast.wind.speed}km/h | ${getDirectionEmoji(parseInt(entry.forecast.swell.direction))}`
        : "No forecast data",
  },
  { key: "comments", label: "Comments" },
];
