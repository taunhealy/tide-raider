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
    entries: Array<{
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
    }>;
    wind?: {
      speed: number;
      direction: string;
    };
    swell?: {
      height: number;
      period: number;
      direction: string;
      cardinalDirection: string;
    };
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
  beachName: string;
  regions: string[];
  countries: string[];
  beaches: string[];
  waveTypes: string[];
  surferName: string;
  minRating: number | null;
  dateRange: { start: string; end: string };
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
        ? `${entry.forecast.swell?.height || 0}m ${getSwellEmoji(entry.forecast.swell?.height || 0)} | ${getWindEmoji(entry.forecast.wind?.speed || 0)} ${entry.forecast.wind?.speed || 0}km/h | ${getDirectionEmoji(parseInt(String(entry.forecast.swell?.direction || 0)))}`
        : "No forecast data",
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
