"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ForecastAlertModal from "@/app/components/alerts/ForecastAlertModal";
import { RandomLoader } from "@/app/components/ui/random-loader";
import { AlertConfig } from "@/app/types/alerts";

export default function AlertPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const alertId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [alert, setAlert] = useState<AlertConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(true);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      toast.error("Please log in to edit alerts", {
        description: "Unauthorized access",
      });
      router.push("/");
      return;
    }

    // If this is a new alert, we don't need to fetch anything
    if (alertId === "new") {
      setIsLoading(false);
      return;
    }

    const fetchAlert = async () => {
      try {
        console.log("Fetching alert with ID:", alertId);
        const response = await fetch(`/api/alerts/${alertId}`);

        if (!response.ok) {
          console.error("Failed to fetch alert:", response.statusText);
          setAlert(null);
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Fetched alert data:", data);
        setAlert(data);
      } catch (error) {
        console.error("Error fetching alert:", error);
        setAlert(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlert();
  }, [alertId, router, session, status]);

  const handleClose = () => {
    setIsModalOpen(false);
    router.push("/alerts");
  };

  const handleSaved = () => {
    toast.success("Alert updated successfully");
    router.push("/alerts");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <RandomLoader isLoading={true} />
        <p className="mt-4 text-gray-600 font-primary">Loading alert...</p>
      </div>
    );
  }

  if (!alert && alertId !== "new") {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-xl font-primary mb-4">Alert not found</h2>
        <button
          onClick={() => router.push("/alerts")}
          className="px-4 py-2 bg-blue-500 text-white rounded-md font-primary"
        >
          Return to Alerts
        </button>
      </div>
    );
  }

  return (
    <ForecastAlertModal
      isOpen={isModalOpen}
      onClose={handleClose}
      logEntry={null}
      existingAlert={alert || undefined}
      onSaved={handleSaved}
      isNew={alertId === "new"}
    />
  );
}
