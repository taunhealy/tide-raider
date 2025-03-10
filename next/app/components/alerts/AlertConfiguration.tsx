import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { AlertConfigTypes, AlertConfig } from "@/app/types/alerts";
import { ForecastProperty, AlertStarRating } from "@/app/types/alerts";

interface AlertConfigurationProps {
  onSave: (config: AlertConfigTypes) => void;
  existingConfig?: AlertConfigTypes;
  selectedLogEntry?: {
    forecast: {
      windSpeed: number;
      windDirection: number;
      waveHeight: number;
      wavePeriod: number;
      temperature: number;
      [key: string]: number; // For any other forecast properties
    };
    region: string;
  };
  isEmbedded?: boolean;
}

const forecastProperties = [
  { id: "windSpeed", name: "Wind Speed", unit: "knots", maxRange: 15 },
  { id: "windDirection", name: "Wind Direction", unit: "°", maxRange: 45 },
  { id: "waveHeight", name: "Wave Height", unit: "m", maxRange: 1 },
  { id: "wavePeriod", name: "Wave Period", unit: "s", maxRange: 4 },
  { id: "temperature", name: "Temperature", unit: "°C", maxRange: 5 },
  { id: "swellHeight", name: "Swell Height", unit: "m", maxRange: 2 },
  { id: "swellPeriod", name: "Swell Period", unit: "s", maxRange: 5 },
  { id: "swellDirection", name: "Swell Direction", unit: "°", maxRange: 45 },
];

export function AlertConfiguration({
  onSave,
  existingConfig,
  selectedLogEntry,
  isEmbedded = false,
}: AlertConfigurationProps) {
  const [alertConfig, setAlertConfig] = useState<AlertConfigTypes>({
    ...((existingConfig as AlertConfig) || {
      id: undefined,
      name: "",
      region: selectedLogEntry?.region || "",
      notificationMethod: (existingConfig?.notificationMethod || "email") as
        | "email"
        | "whatsapp"
        | "both",
      contactInfo: "",
      active: true,
      forecastDate: new Date(),
      alertType: "variables",
      userId: "",
      logEntryId: null,
      starRating: null,
      forecast: null,
      logEntry: null,
      forecastId: null,
    }),
    // Ensure properties array always exists
    properties: existingConfig?.properties || [
      { property: "windSpeed" as ForecastProperty, range: 2 },
      { property: "windDirection" as ForecastProperty, range: 10 },
      { property: "swellHeight" as ForecastProperty, range: 0.2 },
      { property: "swellPeriod" as ForecastProperty, range: 1 },
      { property: "swellDirection" as ForecastProperty, range: 10 },
    ],
  });

  useEffect(() => {
    if (selectedLogEntry?.region && !alertConfig.region) {
      setAlertConfig((prev) => ({
        ...prev,
        region: selectedLogEntry.region,
      }));
    }
  }, [selectedLogEntry, alertConfig.region]);

  const handlePropertyChange = (index: number, field: string, value: any) => {
    const updatedProperties = [...alertConfig.properties];
    updatedProperties[index] = { ...updatedProperties[index], [field]: value };
    setAlertConfig({ ...alertConfig, properties: updatedProperties });
  };

  const addProperty = () => {
    const usedProperties = new Set(
      alertConfig.properties.map((p) => p.property)
    );

    const availableProperty =
      (forecastProperties.find((p) => !usedProperties.has(p.id))
        ?.id as ForecastProperty) || ("windSpeed" as ForecastProperty);

    setAlertConfig({
      ...alertConfig,
      properties: [
        ...alertConfig.properties,
        {
          property: availableProperty,
          range: getPropertyConfig(availableProperty).step * 10,
        },
      ],
    });
  };

  const removeProperty = (index: number) => {
    const updatedProperties = alertConfig.properties.filter(
      (_, i) => i !== index
    );
    setAlertConfig({ ...alertConfig, properties: updatedProperties });
  };

  // Get the appropriate max range and step for each property
  const getPropertyConfig = (propertyId: string) => {
    const prop = forecastProperties.find((p) => p.id === propertyId);
    return {
      maxRange: prop?.maxRange || 10,
      step: propertyId.includes("Height")
        ? 0.1
        : propertyId.includes("Period")
          ? 0.1
          : propertyId.includes("Direction")
            ? 1
            : 1,
    };
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="font-primary">Alert Configuration</CardTitle>
        <CardDescription className="font-primary">
          Set up alerts for specific surf conditions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="alert-name" className="font-primary">
            Alert Name
          </Label>
          <Input
            id="alert-name"
            value={alertConfig.name}
            onChange={(e) =>
              setAlertConfig({ ...alertConfig, name: e.target.value })
            }
            placeholder="My Surf Alert"
            className="font-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="region" className="font-primary">
            Region
          </Label>
          <Select
            value={alertConfig.region}
            onValueChange={(value) =>
              setAlertConfig({ ...alertConfig, region: value })
            }
          >
            <SelectTrigger id="region" className="font-primary">
              <SelectValue placeholder="Select region">
                {alertConfig.region || "Select region"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="north-sea" className="font-primary">
                North Sea
              </SelectItem>
              <SelectItem value="baltic-sea" className="font-primary">
                Baltic Sea
              </SelectItem>
              <SelectItem value="Western Cape" className="font-primary">
                Western Cape
              </SelectItem>
              {selectedLogEntry?.region &&
                !["north-sea", "baltic-sea", "Western Cape"].includes(
                  selectedLogEntry.region
                ) && (
                  <SelectItem
                    value={selectedLogEntry.region}
                    className="font-primary"
                  >
                    {selectedLogEntry.region}
                  </SelectItem>
                )}
            </SelectContent>
          </Select>
          {selectedLogEntry?.region && (
            <p className="text-xs text-gray-500 mt-1 font-primary">
              Region from selected log: {selectedLogEntry.region}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="font-primary">Forecast Properties</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addProperty}
              className="font-primary"
            >
              Add Property
            </Button>
          </div>

          {alertConfig.properties.map((prop, index) => (
            <div
              key={index}
              className="space-y-2 p-4 border rounded-md bg-[var(--color-bg-secondary)] border-[var(--color-border-light)]"
            >
              <div className="flex justify-between items-center">
                <Label className="font-primary text-[var(--color-text-primary)]">
                  Property {index + 1}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProperty(index)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  ✕
                </Button>
              </div>

              <Select
                value={prop.property}
                onValueChange={(value) =>
                  handlePropertyChange(index, "property", value)
                }
              >
                <SelectTrigger className="font-primary">
                  <SelectValue>
                    {forecastProperties.find((fp) => fp.id === prop.property)
                      ?.name || "Select property"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {forecastProperties.map((forecastProp) => (
                    <SelectItem
                      key={forecastProp.id}
                      value={forecastProp.id}
                      className="font-primary"
                    >
                      {forecastProp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <Label className="font-primary">
                    Variation Range: ±{prop.range}
                    {
                      forecastProperties.find((fp) => fp.id === prop.property)
                        ?.unit
                    }
                  </Label>
                  <span className="text-xs text-gray-500 font-primary">
                    {getPropertyConfig(prop.property).step} increments
                  </span>
                </div>
                <Slider
                  min={0}
                  max={getPropertyConfig(prop.property).maxRange}
                  step={getPropertyConfig(prop.property).step}
                  value={[prop.range]}
                  onValueChange={(value) =>
                    handlePropertyChange(index, "range", value[0])
                  }
                  className="mt-2"
                />
                {selectedLogEntry?.forecast && (
                  <div className="text-xs text-[var(--color-text-secondary)] font-primary mt-1">
                    Range:{" "}
                    {(
                      selectedLogEntry.forecast[prop.property] - prop.range
                    ).toFixed(1)}
                    -{" "}
                    {(
                      selectedLogEntry.forecast[prop.property] + prop.range
                    ).toFixed(1)}{" "}
                    {
                      forecastProperties.find((fp) => fp.id === prop.property)
                        ?.unit
                    }
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Label className="font-primary">Notification Method</Label>
          <Select
            value={alertConfig.notificationMethod}
            onValueChange={(value: string) =>
              setAlertConfig({
                ...alertConfig,
                notificationMethod: value as "email" | "whatsapp" | "both",
              })
            }
          >
            <SelectTrigger className="font-primary">
              <SelectValue>
                {alertConfig.notificationMethod === "email"
                  ? "Email"
                  : alertConfig.notificationMethod === "whatsapp"
                    ? "WhatsApp"
                    : alertConfig.notificationMethod === "both"
                      ? "Both"
                      : "Select notification method"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email" className="font-primary">
                Email
              </SelectItem>
              <SelectItem value="whatsapp" className="font-primary">
                WhatsApp
              </SelectItem>
              <SelectItem value="both" className="font-primary">
                Both
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-info" className="font-primary">
            {alertConfig.notificationMethod === "email"
              ? "Email Address"
              : alertConfig.notificationMethod === "whatsapp"
                ? "WhatsApp Number"
                : "Email & WhatsApp"}
          </Label>
          <Input
            id="contact-info"
            value={alertConfig.contactInfo}
            onChange={(e) =>
              setAlertConfig({ ...alertConfig, contactInfo: e.target.value })
            }
            placeholder={
              alertConfig.notificationMethod === "email"
                ? "you@example.com"
                : alertConfig.notificationMethod === "whatsapp"
                  ? "+1234567890"
                  : "email@example.com, +1234567890"
            }
            className="font-primary"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={alertConfig.active}
            onCheckedChange={(checked) =>
              setAlertConfig({ ...alertConfig, active: checked })
            }
          />
          <Label htmlFor="active" className="font-primary">
            Alert Active
          </Label>
        </div>
      </CardContent>

      {/* Only show the Save Alert button if not embedded in RaidLogForm */}
      {!isEmbedded && (
        <CardFooter>
          <Button
            onClick={() => onSave(alertConfig)}
            className="w-full font-primary"
          >
            Save Alert
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
