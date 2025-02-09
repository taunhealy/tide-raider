import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { getWindEmoji } from "@/lib/forecastUtils";
import { getSwellEmoji } from "@/lib/forecastUtils";
import { getDirectionEmoji } from "@/lib/forecastUtils";

interface SurfLog {
  id: string;
  date: string;
  beachName: string;
  forecast: {
    wind: { speed: number; direction: string };
    swell: { height: number; period: number; direction: string };
  };
  surferRating: number;
  surferName: string;
}

import { WaveAnimation } from "./WaveAnimation";

const SponsorContainer = () => {
  const [showLog, setShowLog] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Fetch surf logs using React Query
  const { data: logs } = useQuery({
    queryKey: ["questLogs"],
    queryFn: async () => {
      const response = await fetch("/api/quest-log");
      if (!response.ok) throw new Error("Failed to fetch logs");
      const data = await response.json();
      return data.entries as SurfLog[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Get most recent log
  const recentLog = logs?.[0];

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const cycle = () => {
      setShowLog(true);
      timeout = setTimeout(() => {
        setShowLog(false);
        setTimeout(cycle, 14000); // Total cycle time = 14s (9s visible + 5s hidden)
      }, 9000); // Show log for 9 seconds
    };

    if (recentLog) cycle();
    return () => clearTimeout(timeout);
  }, [recentLog]);

  useEffect(() => {
    const handleScroll = () => {
      const mainForecast = document.querySelector("[data-forecast-widget]");
      const footer = document.querySelector("footer");
      if (!mainForecast || !footer) return;

      const forecastRect = mainForecast.getBoundingClientRect();
      const footerRect = footer.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      setIsVisible(
        forecastRect.bottom < 0 && footerRect.top > windowHeight - 100
      );
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!recentLog) return null;

  return (
    <div
      className={cn(
        "fixed bottom-9 right-4 bg-white rounded-lg shadow-lg p-4 z-50",
        "transition-all duration-300 ease-in-out",
        "transform",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-4">
        {/* Text Content */}
        <div className="flex-1 min-w-[160px] space-y-2">
          <Link
            href="mailto:advertise@tideraider.com?subject=Sponsorship Inquiry"
            className={`group flex flex-col cursor-pointer transition-opacity duration-1000 ${
              showLog ? "opacity-0" : "opacity-100"
            }`}
          >
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-[var(--color-primary)]">
                Partnership Opportunities
              </h3>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Reach active water sports enthusiasts
              </p>
            </div>
            <div className="mt-1 text-xs font-medium text-[var(--color-tertiary)] flex items-center gap-1">
              Contact Us
              <span className="transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </Link>

          {/* Log Display */}
          <div
            className={`absolute inset-0 pl-4 pr-12 pt-4 transition-opacity duration-1000 ${
              showLog ? "opacity-100" : "opacity-0"
            }`}
          >
            <Link
              href="mailto:advertise@tideraider.com?subject=Sponsorship Inquiry"
              className="flex flex-col cursor-pointer group"
            >
              <p className="text-xs font-medium">{recentLog.surferName}</p>
              <div className="flex justify-between items-start mt-1">
                <div className="space-y-1">
                  <p className="text-[0.6rem] uppercase tracking-wide text-[var(--color-text-secondary)]">
                    {recentLog.beachName}
                  </p>
                  <div className="flex items-center justify-start space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-[0.7rem] ${
                          i < Math.floor(recentLog.surferRating)
                            ? "opacity-100"
                            : "opacity-20"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Forecast Information */}
                <div className="text-right space-y-1">
                  <div className="text-[0.6rem] text-[var(--color-text-secondary)]">
                    {getWindEmoji(recentLog.forecast.wind.speed)}{" "}
                    {recentLog.forecast.wind.direction} @{" "}
                    {recentLog.forecast.wind.speed}km/h
                  </div>
                  <div className="text-[0.6rem] text-[var(--color-text-secondary)]">
                    {getSwellEmoji(recentLog.forecast.swell.height)}{" "}
                    {recentLog.forecast.swell.height}m @{" "}
                    {recentLog.forecast.swell.period}s{" "}
                    {getDirectionEmoji(
                      (parseInt(recentLog.forecast.swell.direction) + 180) % 360
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Wave Animation Circle */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden group">
          <div className="absolute inset-0 p-1.5">
            <WaveAnimation />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SponsorContainer;
