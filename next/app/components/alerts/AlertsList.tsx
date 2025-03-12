"use client";

import { Button } from "@/app/components/ui/Button";
import { Switch } from "@/app/components/ui/Switch";
import { Bell, Pencil, Trash2, Star as StarIcon } from "lucide-react";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
} from "@/app/components/ui/Card";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { Alert } from "@/app/types/alerts";

type ForecastProperty =
  | "windSpeed"
  | "windDirection"
  | "swellHeight"
  | "swellPeriod"
  | "swellDirection";

const getForecastProperty = (prop: string): ForecastProperty => {
  switch (prop.toLowerCase()) {
    case "windspeed":
      return "windSpeed";
    case "winddirection":
      return "windDirection";
    case "swellheight":
      return "swellHeight";
    case "swellperiod":
      return "swellPeriod";
    case "swelldirection":
      return "swellDirection";
    default:
      return "windSpeed"; // fallback
  }
};

export function AlertsList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "variable" | "rating">(
    "all"
  );
  const queryClient = useQueryClient();

  // Fetch alerts from the API
  const { data: alerts, isLoading } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const response = await fetch(
        "/api/alerts?include=logEntry.forecast,logEntry.beach"
      );
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

  const handleNewAlert = () => {
    router.push("/alerts/new");
  };

  const handleDelete = (alertId: string) => {
    if (confirm("Are you sure you want to delete this alert?")) {
      deleteMutation.mutate(alertId);
    }
  };

  const handleToggleActive = (alertId: string, active: boolean) => {
    toggleActiveMutation.mutate({ alertId, active });
  };

  function getUnit(property: string): string {
    switch (property.toLowerCase()) {
      case "windspeed":
        return "kts";
      case "winddirection":
      case "swelldirection":
        return "°";
      case "swellheight":
        return "m";
      case "swellperiod":
        return "s";
      default:
        return "";
    }
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
        <Button onClick={handleNewAlert} className="mt-4 font-primary">
          Create Alert
        </Button>
      </div>
    );
  }

  // Filter alerts based on active tab
  const filteredAlerts = alerts.filter((alert: Alert) => {
    if (activeTab === "all") return true;
    if (activeTab === "variable") return alert.alertType !== "rating";
    if (activeTab === "rating") return alert.alertType === "rating";
    return true;
  });

  return (
    <>
      <div className="mb-6 border-b border-[var(--color-border-light)]">
        <div className="flex space-x-4 overflow-x-auto pb-1 scrollbar-hide">
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
              {alerts.filter((a: Alert) => a.alertType !== "rating").length}
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
              {alerts.filter((a: Alert) => a.alertType === "rating").length}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 auto-rows-fr">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 border rounded-lg bg-[var(--color-bg-primary)] border-[var(--color-border-light)] col-span-full">
            <Bell className="mx-auto h-12 w-12 text-[var(--color-text-secondary)]" />
            <h3 className="mt-2 text-lg font-medium font-primary text-[var(--color-text-primary)]">
              No {activeTab !== "all" ? activeTab : ""} alerts found
            </h3>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)] font-primary">
              Create a new alert to get notified when conditions match.
            </p>
            <Button onClick={handleNewAlert} className="mt-4 font-primary">
              Create Alert
            </Button>
          </div>
        ) : (
          filteredAlerts.map((alert: Alert) => (
            <Card
              key={alert.id}
              className="bg-[var(--color-bg-primary)] border-[var(--color-border-light)] hover:border-[var(--color-border-medium)] hover:shadow-sm transition-all duration-300 h-full flex flex-col"
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
                      onClick={() =>
                        alert.id && router.push(`/alerts/${alert.id}`)
                      }
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
              <CardContent className="flex-grow flex-1">
                <div className="text-sm space-y-2 sm:space-y-3 font-primary h-full flex flex-col">
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
                  <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-[var(--color-border-light)] flex-grow">
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
                        <div className="space-y-4">
                          {/* Reference Forecast Section */}
                          {alert.logEntry && alert.logEntry.forecast && (
                            <div className="bg-[var(--color-bg-secondary)] p-3 rounded-md">
                              <p className="text-sm font-medium mb-2">
                                Reference Conditions:
                              </p>
                              <div className="flex flex-col gap-4">
                                {alert.properties?.map((prop, index) => {
                                  const forecastValue =
                                    alert.logEntry?.forecast?.[
                                      getForecastProperty(prop.property)
                                    ];

                                  return (
                                    <div key={index} className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-4">
                                          <span className="text-[13px] sm:text-[14px] font-medium text-[var(--color-text-primary)] font-primary">
                                            {prop.property === "windSpeed"
                                              ? "Wind Speed"
                                              : prop.property ===
                                                  "windDirection"
                                                ? "Wind Direction"
                                                : prop.property ===
                                                    "swellHeight"
                                                  ? "Swell Height"
                                                  : prop.property ===
                                                      "swellPeriod"
                                                    ? "Swell Period"
                                                    : prop.property ===
                                                        "swellDirection"
                                                      ? "Swell Direction"
                                                      : prop.property}
                                          </span>
                                          {forecastValue !== undefined && (
                                            <>
                                              <span className="text-[18px] sm:text-[21px] font-medium text-[var(--color-text-primary)] font-primary">
                                                {forecastValue.toFixed(1)}
                                                {getUnit(prop.property)}
                                              </span>
                                              <span className="px-2 py-0.5 bg-[var(--color-alert-badge)] text-[var(--color-alert-badge-text)] rounded-full text-xs font-medium">
                                                ±{prop.range}
                                                {getUnit(prop.property)}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      {forecastValue !== undefined && (
                                        <div className="text-[12px] text-[var(--color-text-secondary)] font-primary">
                                          Range:{" "}
                                          {(forecastValue - prop.range).toFixed(
                                            1
                                          )}{" "}
                                          -{" "}
                                          {(forecastValue + prop.range).toFixed(
                                            1
                                          )}
                                          {getUnit(prop.property)}
                                        </div>
                                      )}
                                      {index < alert.properties.length - 1 && (
                                        <div className="border-b border-[var(--color-border-light)] my-3"></div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
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
    </>
  );
}
