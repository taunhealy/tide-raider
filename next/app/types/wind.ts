import { Beach } from "./beaches";

export type WindData = {
  date: Date;
  region: string;
  windSpeed: number; // Int in DB
  windDirection: string; // String in DB
  swellHeight: number; // Float in DB
  swellPeriod: number; // Int in DB
  swellDirection: number; // Float in DB
};

export type ForecastData = {
  updatedAt: Date;
  forecasts: { [date: string]: WindData };
};

export interface BeachContainerProps {
  initialBeaches: Beach[];
  windData: WindData | null | undefined;
}

// Also add a reusable type for components that use windData
export type WindDataProp = WindData | null | undefined;

export interface WeeklyForecast {
  [date: string]: WindData;
}
