import React from "react";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "../lib/forecastUtils";

import { Prisma } from "@prisma/client";
import type { Beach, ForecastA } from "@prisma/client";
import type { Alert } from "./alerts";

export interface LogEntry {
  id: string;
  userId: string | null;
  nationality?: string;
  user?: {
    id: string;
    nationality?: string;
  };
  date: string | Date;
  sessionDate?: Date;
  surferName: string | null;
  surferEmail: string | null;
  beachName?: string | null;
  beachId?: string | null;
  forecast?: {
    windSpeed: number;
    windDirection: number;
    swellHeight: number;
    swellPeriod: number;
    swellDirection: number;
  } | null;
  surferRating: number;
  comments: string | null;
  imageUrl: string | null;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  windSpeed?: number;
  windDirection?: number;
  swellHeight?: number;
  swellDirection?: number;
  beach?: Beach | null;
  isAnonymous: boolean;
  continent: string | null;
  country: string | null;
  region: string | null;
  waveType: string | null;
  hasAlert?: boolean;
  alertId?: string;
  existingAlert?: Alert | null;
  isMyAlert?: boolean;
}

export interface CreateLogEntryInput {
  beachName: string;
  userId: string;
  date: Date;
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
  forecast?: ForecastA;
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

export type RegionFilters = {
  continents: string[];
  countries: string[];
  regions: string[];
  beaches: string[];
  waveTypes: string[];
};

export interface SurfCondition {
  id: string;
  date: string;
  region: string;
  forecast: {
    entries: Array<{
      wind: { speed: number; direction: string };
      swell: { height: number; period: number; direction: string };
      timestamp: number;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
}
