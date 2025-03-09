"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ForecastAlertModal from "@/app/components/alerts/ForecastAlertModal";
import { RandomLoader } from "@/app/components/ui/RandomLoader";

export default function NewAlertPage() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading for a smoother transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    router.push("/dashboard/alerts");
  };

  const handleAlertSaved = () => {
    router.push("/dashboard/alerts");
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
        existingAlert={undefined}
        onSaved={handleAlertSaved}
        isNew={true}
      />
    </div>
  );
}
