export type ForecastProperty =
  | "windSpeed"
  | "windDirection"
  | "swellHeight"
  | "swellPeriod"
  | "swellDirection";

export type AlertConfig = {
  id: string;
  name: string;
  region: string;
  properties: {
    property: ForecastProperty;
    range: number;
  }[];
  notificationMethod: "email" | "whatsapp" | "both";
  contactInfo: string;
  active?: boolean;
  forecastDate?: Date;
};

export interface AlertConfigTypes {
  id: string;
  name: string;
  region: string | null | undefined;
  forecastDate: Date | string | null | undefined;
  properties: Array<{
    property: string;
    range: number;
  }>;
  notificationMethod: "email" | "whatsapp" | "both";
  contactInfo: string;
  active: boolean;
  logEntryId?: string | null;
  alertType?: "variables" | "rating";
  starRating?: "4+" | "5" | null;
}
