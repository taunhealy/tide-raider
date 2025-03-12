import { Beach } from "./beaches";

export type WindData = {
  date: Date;
  region: string;
  windSpeed: number; // Matches ForecastA.windSpeed (Int)
  windDirection: number; // Changed to number to match ForecastA.windDirection
  swellHeight: number; // Matches ForecastA.swellHeight (Float)
  swellPeriod: number; // Matches ForecastA.swellPeriod (Int)
  swellDirection: number; // Matches ForecastA.swellDirection (Float)
  createdAt?: Date; // From ForecastA model
  updatedAt?: Date; // From ForecastA model
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
