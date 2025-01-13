export interface LogEntry {
  id: string;
  date: string;
  surferName: string;
  beachName: string;
  forecast: {
    wind: {
      direction: string;
      speed: number;
    };
    swell: {
      height: number;
      period: number;
      direction: string;
      cardinalDirection: string;
    };
    tide: string;
    forecastRating: number;
  };
  surferRating: number;
  comments: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLogEntryInput {
  date: string;
  surferName: string;
  beachName: string;
  surferRating: number;
  comments: string;
}
