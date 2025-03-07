"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import ForecastAlertModal from "@/app/components/alerts/ForecastAlertModal";
import { AlertConfig } from "@/app/types/alerts";
import { RandomLoader } from "@/app/components/ui/RandomLoader";

export default function AlertEditPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [alert, setAlert] = useState<AlertConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const alertId = params.id as string;

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      toast.error("Please log in to edit alerts", {
        description: "Unauthorized access",
      });
      router.push("/");
      return;
    }

    const fetchAlert = async () => {
      try {
        console.log("Fetching alert with ID:", alertId);
        const response = await fetch(`/api/alerts/${alertId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch alert: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched alert data:", data);
        setAlert(data);
      } catch (error) {
        console.error("Error fetching alert:", error);
        toast.error("Failed to load alert details", {
          description: "Please try again later",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlert();
  }, [alertId, router, session, status]);

  const handleAlertSaved = () => {
    toast.success("Alert updated successfully");
    router.push("/alerts");
  };

  const handleClose = () => {
    router.push("/alerts");
  };

  if (isLoading) {
    return <RandomLoader isLoading={true} />;
  }

  return (
    <div>
      <ForecastAlertModal
        isOpen={true}
        onClose={handleClose}
        logEntry={null}
        existingAlert={alert || undefined}
        onSaved={handleAlertSaved}
      />
    </div>
  );
}
