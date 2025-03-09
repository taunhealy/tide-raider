"use client";

import { Button } from "@/app/components/ui/button";
import { Switch } from "@/app/components/ui/switch";
import { Bell, Pencil, Trash2, Star as StarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { useState } from "react";
import ForecastAlertModal from "./ForecastAlertModal";
import { toast } from "sonner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { AlertConfig } from "./AlertConfiguration";

export function AlertsList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertConfig | undefined>(
    undefined
  );
  const [activeTab, setActiveTab] = useState<"all" | "variable" | "rating">(
    "all"
  );
  const queryClient = useQueryClient();

  // Fetch alerts from the API
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const response = await fetch("/api/alerts");
      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }
      return response.json();
    },
  });

  // Delete alert mutation
  const deleteMutation = useMutation({
    mutationFn: async (alertId: string) => {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete alert");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Alert deleted");
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (error) => {
      toast.error("Failed to delete alert", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  // Toggle alert active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      alertId,
      active,
    }: {
      alertId: string;
      active: boolean;
    }) => {
      const response = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active }),
      });
      if (!response.ok) {
        throw new Error("Failed to update alert");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
    onError: (error) => {
      toast.error("Failed to update alert", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    },
  });

  const handleEditClick = (alertId: string) => {
    const alert = alerts?.find((a: AlertConfig) => a.id === alertId);
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

  const handleDelete = (alertId: string) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      deleteMutation.mutate(alertId);
    }
  };

  const handleToggleActive = (alertId: string, active: boolean) => {
    toggleActiveMutation.mutate({ alertId, active });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500 font-primary">
          Loading alerts...
        </span>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg bg-[var(--color-bg-primary)]">
        <Bell className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" />
        <h3 className="mt-2 text-lg font-medium font-primary text-[var(--color-text-primary)]">
          No alerts yet
        </h3>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)] font-primary">
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

  // Filter alerts based on active tab
  const filteredAlerts = alerts.filter((alert: AlertConfig) => {
    if (activeTab === "all") return true;
    if (activeTab === "variable") return alert.alertType !== "rating";
    if (activeTab === "rating") return alert.alertType === "rating";
    return true;
  });

  return (
    <>
      <div className="mb-6 border-b border-[var(--color-border-light)]">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("all")}
            className={`py-3 px-4 font-primary ${
              activeTab === "all"
                ? "border-b-2 border-[var(--color-alert-tab-active)] text-[var(--color-alert-tab-active)] font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            All Alerts
            <span className="ml-2 text-xs bg-[var(--color-bg-secondary)] px-2 py-1 rounded-full">
              {alerts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("variable")}
            className={`py-3 px-4 font-primary ${
              activeTab === "variable"
                ? "border-b-2 border-[var(--color-alert-tab-active)] text-[var(--color-alert-tab-active)] font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Variable Alerts
            <span className="ml-2 text-xs bg-[var(--color-bg-secondary)] px-2 py-1 rounded-full">
              {
                alerts.filter((a: AlertConfig) => a.alertType !== "rating")
                  .length
              }
            </span>
          </button>
          <button
            onClick={() => setActiveTab("rating")}
            className={`py-3 px-4 font-primary ${
              activeTab === "rating"
                ? "border-b-2 border-[var(--color-alert-tab-active)] text-[var(--color-alert-tab-active)] font-medium"
                : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            Star Rating Alerts
            <span className="ml-2 text-xs bg-[var(--color-bg-secondary)] px-2 py-1 rounded-full">
              {
                alerts.filter((a: AlertConfig) => a.alertType === "rating")
                  .length
              }
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-[var(--color-bg-primary)] border-[var(--color-border-light)]">
            <Bell className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" />
            <h3 className="mt-2 text-lg font-medium font-primary text-[var(--color-text-primary)]">
              No {activeTab !== "all" ? activeTab : ""} alerts found
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)] font-primary">
              Create a new alert to get notified when conditions match.
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="mt-4 font-primary"
            >
              Create Alert
            </Button>
          </div>
        ) : (
          filteredAlerts.map((alert: AlertConfig) => (
            <Card
              key={alert.id}
              className="bg-[var(--color-bg-primary)] border-[var(--color-border-light)] hover:border-[var(--color-border-medium)] hover:shadow-sm transition-all duration-300"
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-primary text-[var(--color-text-primary)] flex items-center">
                    {alert.alertType === "rating" ? (
                      <span className="mr-2 text-[var(--color-alert-icon-rating)]">
                        ⭐
                      </span>
                    ) : (
                      <span className="mr-2">📊</span>
                    )}
                    {alert.name}
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={alert.active}
                      onCheckedChange={(checked) => {
                        if (alert.id) {
                          handleToggleActive(alert.id, checked);
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
                      className="h-9 w-9 hover:bg-[var(--color-bg-secondary)]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => alert.id && handleDelete(alert.id)}
                      className="h-9 w-9 text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-3 font-primary">
                  <p className="text-[var(--color-text-secondary)]">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      Region:
                    </span>{" "}
                    {alert.region}
                  </p>
                  <p className="text-[var(--color-text-secondary)]">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      Notification:
                    </span>{" "}
                    {alert.notificationMethod} ({alert.contactInfo})
                  </p>
                  <div className="mt-3 pt-3 border-t border-[var(--color-border-light)]">
                    {alert.alertType === "rating" ? (
                      <div>
                        <p className="text-[var(--color-text-primary)] font-medium mb-2">
                          Alert when conditions reach:
                        </p>
                        <div className="flex items-center mt-1 bg-[var(--color-bg-secondary)] p-3 rounded-md">
                          {alert.starRating === "5" ? (
                            <>
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((i) => (
                                  <StarIcon
                                    key={i}
                                    className="h-5 w-5 fill-[var(--color-alert-icon-rating)] text-[var(--color-alert-icon-rating)]"
                                  />
                                ))}
                              </div>
                              <span className="ml-3 font-primary">
                                5 Stars (Perfect conditions)
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="flex">
                                {[1, 2, 3, 4].map((i) => (
                                  <StarIcon
                                    key={i}
                                    className="h-5 w-5 fill-[var(--color-alert-icon-rating)] text-[var(--color-alert-icon-rating)]"
                                  />
                                ))}
                                <StarIcon className="h-5 w-5 text-gray-300" />
                              </div>
                              <span className="ml-3 font-primary">
                                4+ Stars (Good conditions)
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-[var(--color-text-primary)] font-medium mb-2">
                          Match conditions within:
                        </p>
                        <div className="grid grid-cols-2 gap-3 mt-1 bg-[var(--color-bg-secondary)] p-3 rounded-md">
                          {alert.properties?.map((prop, index) => (
                            <div key={index} className="flex items-center">
                              <span className="font-medium text-[var(--color-text-primary)]">
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
                              <span className="ml-2 px-2 py-0.5 bg-[var(--color-alert-badge)] text-[var(--color-alert-badge-text)] rounded-full text-xs font-medium">
                                ±{prop.range}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ForecastAlertModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        logEntry={null}
        existingAlert={selectedAlert}
        onSaved={handleAlertSaved}
        isNew={!selectedAlert}
      />
    </>
  );
}
