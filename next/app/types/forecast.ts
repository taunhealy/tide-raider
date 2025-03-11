export interface ForecastData {
  id?: string;
  date?: Date;
  region: string;
  windSpeed: number;
  windDirection: number;
  swellHeight: number;
  swellPeriod: number;
  swellDirection: number;
  timestamp?: string;
}
