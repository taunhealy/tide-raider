import { Beach } from './beaches'

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
