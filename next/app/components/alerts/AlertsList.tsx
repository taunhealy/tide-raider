"use client";

import { AlertConfig } from "@/app/types/alerts";
import { Button } from "@/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Bell, Pencil, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { useState } from "react";
import ForecastAlertModal from "./ForecastAlertModal";
import { useToast } from "@/app/components/ui/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface AlertsListProps {
  alerts: AlertConfig[];
  onEdit: (alertId: string) => void;
  onDelete: (alertId: string) => void;
  onToggleActive: (alertId: string, active: boolean) => void;
}

export function AlertsList({
  alerts,
  onEdit,
  onDelete,
  onToggleActive,
}: AlertsListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertConfig | undefined>(
    undefined
  );
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleEditClick = (alertId: string) => {
    const alert = alerts.find((a) => a.id === alertId);
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAlert(undefined);
  };

  const handleAlertSaved = () => {
    // Refresh the alerts list
    queryClient.invalidateQueries({ queryKey: ["alerts"] });
    handleModalClose();
  };

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-white">
        <Bell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium font-primary">No alerts yet</h3>
        <p className="mt-1 text-sm text-gray-500 font-primary">
          Create your first alert to get notified when conditions match.
        </p>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="mt-4 font-primary"
        >
          Create Alert
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="bg-white">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg font-primary">
                  {alert.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={alert.active}
                    onCheckedChange={(checked) => {
                      if (alert.id) {
                        onToggleActive(alert.id, checked);
                      }
                    }}
                    aria-label={
                      alert.active ? "Deactivate alert" : "Activate alert"
                    }
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => alert.id && handleEditClick(alert.id)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => alert.id && onDelete(alert.id)}
                    className="h-8 w-8 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 font-primary">
                <p className="text-gray-500">Region: {alert.region}</p>
                <p className="text-gray-500">
                  Notification: {alert.notificationMethod} ({alert.contactInfo})
                </p>
                <div className="mt-2">
                  <p className="text-gray-500 font-medium">
                    Match conditions within:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {alert.properties.map((prop, index) => (
                      <div key={index} className="flex justify-between">
                        <span>
                          {prop.property === "windSpeed"
                            ? "Wind Speed"
                            : prop.property === "windDirection"
                              ? "Wind Direction"
                              : prop.property === "waveHeight"
                                ? "Wave Height"
                                : prop.property === "wavePeriod"
                                  ? "Wave Period"
                                  : prop.property}
                        </span>
                        <span>±{prop.range}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ForecastAlertModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        logEntry={null}
        existingAlert={selectedAlert}
        onSaved={handleAlertSaved}
      />
    </>
  );
}
