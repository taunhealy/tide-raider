import React from "react";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "../lib/forecastUtils";
import type { Beach } from "@/app/types/beaches";
import { Prisma } from "@prisma/client";

export interface LogEntry {
  id: string;
  userId?: string;
  nationality?: string;
  user?: {
    id: string;
    nationality?: string;
  };
  date: string;
  sessionDate?: Date;
  surferName: string;
  surferEmail: string;
  beachName: string;
  beachId: string;
  forecast?: {
    windSpeed: number;
    swellHeight: number;
    swellPeriod: number;
    windDirection: string;
    swellDirection: number;
  };
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
