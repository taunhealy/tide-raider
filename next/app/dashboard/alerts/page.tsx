"use client";

import React, { useState, useEffect } from "react";
import {
  AlertConfiguration,
  AlertConfig,
} from "@/app/components/alerts/AlertConfiguration";
import { AlertsList } from "@/app/components/alerts/AlertsList";
import { Button } from "@/components/ui/button";
import { useToast } from "@/app/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load alerts from localStorage or API
    const savedAlerts = localStorage.getItem("userAlerts");
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  const saveAlertsToStorage = (updatedAlerts: AlertConfig[]) => {
    localStorage.setItem("userAlerts", JSON.stringify(updatedAlerts));
    setAlerts(updatedAlerts);
  };

  const handleSaveAlert = async (alertConfig: AlertConfig) => {
    let updatedAlerts: AlertConfig[];
    try {
      if (editingAlertId) {
        // Update existing alert
        updatedAlerts = alerts.map((alert) =>
          alert.id === editingAlertId
            ? { ...alertConfig, id: editingAlertId }
            : alert
        );

        // Save to API first
        const response = await fetch(`/api/alerts/${editingAlertId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(alertConfig),
        });

        if (!response.ok) {
          throw new Error("Failed to update alert");
        }

        toast({
          title: "Alert updated",
          description: `Your alert "${alertConfig.name}" has been updated.`,
          variant: "success",
        });
      } else {
        // Create new alert
        const newAlert = {
          ...alertConfig,
          id: uuidv4(),
        };

        // Save to API first
        const response = await fetch("/api/alerts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newAlert),
        });

        if (!response.ok) {
          throw new Error("Failed to create alert");
        }

        updatedAlerts = [...alerts, newAlert];
        toast({
          title: "Alert created",
          description: `Your alert "${alertConfig.name}" has been created.`,
          variant: "success",
        });
      }

      saveAlertsToStorage(updatedAlerts);
      setIsCreating(false);
      setEditingAlertId(null);
    } catch (error) {
      console.error("Error saving alert:", error);
      toast({
        title: "Error",
        description: `Failed to save alert. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleEditAlert = (alertId: string) => {
    setEditingAlertId(alertId);
    setIsCreating(true);
  };

  const handleDeleteAlert = (alertId: string) => {
    const alertToDelete = alerts.find((alert) => alert.id === alertId);
    const updatedAlerts = alerts.filter((alert) => alert.id !== alertId);
    saveAlertsToStorage(updatedAlerts);

    toast({
      title: "Alert deleted",
      description: `Your alert "${alertToDelete?.name}" has been deleted.`,
    });
  };

  const handleToggleActive = (alertId: string, active: boolean) => {
    const updatedAlerts = alerts.map((alert) =>
      alert.id === alertId ? { ...alert, active } : alert
    );
    saveAlertsToStorage(updatedAlerts);

    const alertName = alerts.find((alert) => alert.id === alertId)?.name;
    toast({
      title: active ? "Alert activated" : "Alert deactivated",
      description: `Your alert "${alertName}" has been ${
        active ? "activated" : "deactivated"
      }.`,
    });
  };

  const getEditingAlert = () => {
    if (!editingAlertId) return undefined;
    return alerts.find((alert) => alert.id === editingAlertId);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold font-primary text-primary">
          Forecast Alerts
        </h1>
        {!isCreating && (
          <Button onClick={() => setIsCreating(true)} className="font-primary">
            Create New Alert
          </Button>
        )}
      </div>

      {isCreating ? (
        <div className="bg-card rounded-lg p-6 shadow-sm space-y-6">
          <AlertConfiguration
            onSave={handleSaveAlert}
            existingConfig={getEditingAlert()}
          />
          <Button
            variant="outline"
            onClick={() => {
              setIsCreating(false);
              setEditingAlertId(null);
            }}
            className="w-full font-primary mt-4"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <div>
          <p className="text-muted-foreground mb-8 font-primary text-lg">
            Set up personalized alerts to get notified when surf conditions
            match your preferences.
          </p>
          <div className="bg-card rounded-lg p-6 shadow-sm">
            <AlertsList
              alerts={alerts}
              onEdit={handleEditAlert}
              onDelete={handleDeleteAlert}
              onToggleActive={handleToggleActive}
            />
          </div>
        </div>
      )}
    </div>
  );
}
