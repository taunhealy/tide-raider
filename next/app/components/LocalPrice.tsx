"use client";

import { useCurrencyConverter } from "@/app/hooks/useCurrencyConverter";
import { useEffect, useState } from "react";

interface LocalPriceProps {
  amount: number;
  showOriginal?: boolean;
}

export default function LocalPrice({
  amount,
  showOriginal = false,
}: LocalPriceProps) {
  const [isClient, setIsClient] = useState(false);
  const { formatted, currency } = useCurrencyConverter(amount, "ZAR");

  // Use consistent ZAR format for both server and client
  const zarFormat = new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Always use the same ZAR format for server-side rendering
  if (!isClient) {
    return <span className="text-gray-700 font-medium">{zarFormat}</span>;
  }

  // Show converted price with original ZAR price in smaller text if requested
  if (showOriginal && currency !== "ZAR") {
    return (
      <div className="text-right">
        <div>{formatted}</div>
        <div className="text-sm text-gray-500">{zarFormat}</div>
      </div>
    );
  }

  return <span className="text-gray-700 font-medium">{formatted}</span>;
}
