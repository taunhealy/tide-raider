"use client";

import Script from "next/script";

interface FlightSearchWidgetProps {
  destination: string; // IATA code from Sanity
}

export default function FlightSearchWidget({
  destination,
}: FlightSearchWidgetProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Find Flights</h3>
      <Script
        src={`https://tp.media/content?currency=usd&trs=383996&shmarker=601781&locale=en&stops=any&destination=${destination}&show_hotels=true&powered_by=true&border_radius=0&plain=true&color_button=%2300A991&color_button_text=%23ffffff&promo_id=3414&campaign_id=111`}
        strategy="lazyOnload"
      />
    </div>
  );
}
