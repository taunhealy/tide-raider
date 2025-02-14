import React from "react";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "../lib/forecastUtils";
import type { Beach } from "./beaches";
import { Prisma } from "@prisma/client";

export interface LogEntry {
  id: string;
  userId?: string;
  user?: { id: string };
  date: Date;
  sessionDate?: Date;
  surferName: string;
  surferEmail: string;
  beachName: string;
  beachId: string;
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
    timestamp: string;
  } | null;
  surferRating: number;
  comments: string;
  imageUrl: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  windSpeed?: number;
  windDirection?: number;
  swellHeight?: number;
  swellDirection?: number;
  beach: Beach;
  isAnonymous: boolean;
  continent: string;
  country: string;
  region: string;
  waveType: string;
}

export interface CreateLogEntryInput {
  beachName: string;
  userId: string;
  date: string;
  surferName: string;
  surferRating: number;
  comments?: string;
  imageUrl?: string;
  isPrivate?: boolean;
  beach?: {
    continent: string;
    country: string;
    region: string;
    waveType: string;
  };
  forecast?: Prisma.InputJsonValue;
}

export interface SortConfig {
  field: keyof LogEntry;
  direction: "asc" | "desc";
}

export interface FilterConfig {
  beachName?: string;
  regions?: string[];
  countries?: string[];
  beaches?: string[];
  waveTypes?: string[];
  surferName?: string;
  minRating?: number | null;
  dateRange?: { start: string; end: string };
  isPrivate: boolean;
  entries?: LogEntry[];
  surfers?: string[];
  region?: string;
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
    render: (entry: LogEntry) => {
      const forecastData = entry.forecast;
      if (!forecastData?.swell || !forecastData?.wind) {
        return "No forecast data";
      }

      const { swell, wind } = forecastData;

      return `${swell.height}m ${getSwellEmoji(swell.height)} | ${getWindEmoji(wind.speed)} ${wind.speed}km/h | ${getDirectionEmoji(parseInt(swell.direction))}`;
    },
  },
  { key: "comments", label: "Comments" },
];

export type RegionFilters = {
  continents: string[];
  countries: string[];
  regions: string[];
  beaches: string[];
  waveTypes: string[];
};
