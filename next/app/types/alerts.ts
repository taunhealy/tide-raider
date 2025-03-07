export interface AlertConfig {
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
}
