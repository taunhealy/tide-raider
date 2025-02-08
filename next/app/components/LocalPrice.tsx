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
  const { formatted, currency } = useCurrencyConverter(amount);

  // Use consistent initial format for both server and client
  const euroFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  }).format(amount);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Return server-side format until client-side hydration is complete
  if (!isClient) {
    return <span className="text-gray-700 font-medium">{euroFormat}</span>;
  }

  // Show original EUR price in smaller text if requested
  if (showOriginal && currency !== "EUR") {
    return (
      <div className="text-right">
        <div>{formatted}</div>
        <div className="text-sm text-gray-500">{euroFormat}</div>
      </div>
    );
  }

  return <span className="text-gray-700 font-medium">{formatted}</span>;
}
