import { LogEntry } from "./questlogs";
import type { ForecastA } from "@prisma/client";

export type ForecastProperty =
  | "windSpeed"
  | "windDirection"
  | "swellHeight"
  | "swellPeriod"
  | "swellDirection"
  | "waveHeight"
  | "wavePeriod"
  | "temperature";

export type AlertStarRating = "4+" | "5";

export interface Alert {
  id: string;
  name: string;
  region: string;
  forecastDate: Date;
  properties: AlertProperty[];
  notificationMethod: "email" | "whatsapp" | "both";
  contactInfo: string;
  active: boolean;
  userId: string;
  logEntryId: string | null;
  alertType: "variables" | "rating";
  starRating: "4+" | "5" | null;
  forecast: ForecastA | null;
  forecastId: string | null;
  createdAt: Date;
  updatedAt: Date;
  logEntry?: LogEntry | null;
}

export interface AlertProperty {
  property: ForecastProperty;
  range: number;
}

export interface AlertConfig {
  name: string;
  region: string;
  forecastDate: Date;
  properties: AlertProperty[];
  notificationMethod: "email" | "whatsapp" | "both";
  contactInfo: string;
  active: boolean;
  logEntryId: string | null;
  alertType: "variables" | "rating";
  starRating: "4+" | "5" | null;
  forecast: ForecastA | null;
  forecastId: string | null;
}

// Use this for creating/updating alerts
export type AlertConfigTypes = AlertConfig;

export interface ForecastData {
  windSpeed: number;
  windDirection: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
}
