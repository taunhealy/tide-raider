"use client";

import { useEffect, useRef } from "react";

interface FlightSearchWidgetProps {
  destination?: string;
}

export default function FlightSearchWidget({
  destination,
}: FlightSearchWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src =
      "https://tp.media/content?currency=usd&trs=383996&shmarker=601781.601781&locale=en&stops=any&show_hotels=true&powered_by=true&border_radius=0&plain=true&color_button=%2300A991&color_button_text=%23ffffff&promo_id=3414&campaign_id=111";
    script.async = true;

    if (containerRef.current) {
      containerRef.current.appendChild(script);
    }

    return () => {
      if (containerRef.current) {
        const scriptElement = containerRef.current.querySelector("script");
        if (scriptElement) {
          scriptElement.remove();
        }
      }
    };
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">Find Flights</h3>
      <div ref={containerRef} className="flight-search-container" />
    </div>
  );
}
