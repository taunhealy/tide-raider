import { Beach } from './beaches'

export interface SurfForecast {
  wind: {
    speed: number;
    direction: string;  // Cardinal direction (e.g., "SSE")
  };
  swell: {
    height: number;
    period: number;
    direction: string;  // Degrees (e.g., "216")
  };
  timestamp: number;
}

export interface WindData {
  wind: {
    direction: string
    speed: number
  }
  swell: {
    height: number
    direction: string
    period: number
    cardinalDirection: string
  }
  timestamp: number
}

export interface BeachContainerProps {
  initialBeaches: Beach[]
  windData: WindData | null
}
