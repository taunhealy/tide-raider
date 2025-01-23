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
  date: Date;
  surferName: string;
  surferEmail: string;
  beachName: string;
  forecast: {
    wind: {
      speed: number;
      direction: string;
    };
    swell: {
      height: number;
      period: number;
      direction: string;
      cardinalDirection: string;
    };
  };
  surferRating: number;
  comments: string;
  imageUrl?: string;
  isAnonymous?: boolean;
  createdAt: Date;
  updatedAt: Date;
  beach?: {
    continent: string;
    country: string;
    region: string;
    waveType: string;
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
  beachName: string;
  date: string;
  surferEmail: string;
  surferName: string;
  surferRating: number;
  comments: string;
  imageUrl?: string;
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

export interface QuestLogTableColumn {
  key: keyof LogEntry | "forecastSummary";
  label: string;
  sortable?: boolean;
  render?: (entry: LogEntry) => React.ReactNode;
}

export const DEFAULT_COLUMNS: QuestLogTableColumn[] = [
  { key: "date", label: "Quest Date", sortable: true },
  { key: "beachName", label: "Location", sortable: true },
  { key: "surferName", label: "Adventurer", sortable: true },
  { key: "surferRating", label: "Wave Rating", sortable: true },
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
