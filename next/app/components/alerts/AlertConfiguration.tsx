import React, { useState } from "react";
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

interface AlertConfigurationProps {
  onSave: (alertConfig: AlertConfig) => void;
  existingConfig?: AlertConfig;
}

export interface AlertConfig {
  id?: string | undefined;
  name: string | undefined;
  region: string | undefined;
  forecastDate: Date | string;
  properties: {
    property: string;
    range: number; // percentage or absolute value depending on property
  }[];
  notificationMethod: "email" | "whatsapp" | "both";
  contactInfo: string;
  active: boolean;
  logEntryId?: string | null;
  alertType?: "variables" | "rating";
  starRating?: "4+" | "5" | null;
}

const forecastProperties = [
  { id: "windSpeed", name: "Wind Speed", unit: "knots" },
  { id: "windDirection", name: "Wind Direction", unit: "°" },
  { id: "waveHeight", name: "Wave Height", unit: "m" },
  { id: "wavePeriod", name: "Wave Period", unit: "s" },
  { id: "temperature", name: "Temperature", unit: "°C" },
];

export function AlertConfiguration({
  onSave,
  existingConfig,
}: AlertConfigurationProps) {
  const [alertConfig, setAlertConfig] = useState<AlertConfig>(
    existingConfig || {
      name: "",
      region: "",
      properties: [{ property: "windSpeed", range: 10 }],
      notificationMethod: "email",
      contactInfo: "",
      active: true,
      forecastDate: new Date(),
    }
  );

  const handlePropertyChange = (index: number, field: string, value: any) => {
    const updatedProperties = [...alertConfig.properties];
    updatedProperties[index] = { ...updatedProperties[index], [field]: value };
    setAlertConfig({ ...alertConfig, properties: updatedProperties });
  };

  const addProperty = () => {
    setAlertConfig({
      ...alertConfig,
      properties: [
        ...alertConfig.properties,
        { property: "windSpeed", range: 10 },
      ],
    });
  };

  const removeProperty = (index: number) => {
    const updatedProperties = alertConfig.properties.filter(
      (_, i) => i !== index
    );
    setAlertConfig({ ...alertConfig, properties: updatedProperties });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-xl font-primary">Configure Alert</CardTitle>
        <CardDescription className="font-primary">
          Get notified when your log matches forecast conditions
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
            placeholder="My Wind Alert"
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
              <SelectValue placeholder="Select region" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="north-sea" className="font-primary">
                North Sea
              </SelectItem>
              <SelectItem value="baltic-sea" className="font-primary">
                Baltic Sea
              </SelectItem>
              <SelectItem value="mediterranean" className="font-primary">
                Mediterranean
              </SelectItem>
              {/* Add more regions as needed */}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="font-primary">Forecast Properties</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={addProperty}
              className="font-primary"
            >
              Add Property
            </Button>
          </div>

          {alertConfig.properties.map((prop, index) => (
            <div key={index} className="space-y-2 p-3 border rounded-md">
              <div className="flex justify-between items-center">
                <Label className="font-primary">Property {index + 1}</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProperty(index)}
                  className="h-8 w-8 p-0 text-red-500 font-primary"
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
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {forecastProperties.map((forecastProp) => (
                    <SelectItem
                      key={forecastProp.id}
                      value={forecastProp.id}
                      className="font-primary"
                    >
                      {forecastProp.name} ({forecastProp.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="font-primary">
                    Accuracy Range: {prop.range}%
                  </Label>
                </div>
                <Slider
                  value={[prop.range]}
                  min={1}
                  max={50}
                  step={1}
                  onValueChange={(value) =>
                    handlePropertyChange(index, "range", value[0])
                  }
                />
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
              <SelectValue placeholder="Select notification method" />
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
      <CardFooter>
        <Button
          onClick={() => onSave(alertConfig)}
          className="w-full font-primary"
        >
          Save Alert
        </Button>
      </CardFooter>
    </Card>
  );
}
