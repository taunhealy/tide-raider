import type { Beach } from "../types/beaches";
import type { WindData } from "../types/wind";
import BeachCard from "./BeachCard";
import { useSubscription } from "../context/SubscriptionContext";
import Link from "next/link";
import { getGatedBeaches } from "../lib/surfUtils";

interface BeachGridProps {
  beaches: Beach[];
  windData: WindData | null;
  isBeachSuitable: (
    beach: Beach,
    conditions: WindData
  ) => {
    suitable: boolean;
    score: number;
  };
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function BeachGrid({
  beaches,
  windData,
  isBeachSuitable,
  isLoading = false,
  children,
}: BeachGridProps) {
  const { isSubscribed } = useSubscription();

  // Show loading state for all cards while loading
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-[16px]">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg p-6 animate-pulse space-y-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Split beaches into free and locked based on subscription
  const freeBeaches = beaches.slice(0, 3);
  const lockedBeaches = beaches.slice(3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-[16px]">
      {/* Free Spots */}
      {freeBeaches.map((beach, index) => (
        <BeachCard
          key={beach.name}
          beach={beach}
          windData={windData}
          isFirst={index === 0}
          isLocked={false}
          isLoading={isLoading}
        />
      ))}

      {/* Locked Spots (Non-subscribed users) */}
      {!isSubscribed &&
        lockedBeaches.map((beach) => (
          <BeachCard
            key={beach.name}
            beach={beach}
            windData={windData}
            isFirst={false}
            isLocked={true}
            isLoading={isLoading}
          />
        ))}

      {/* Subscribed Spots */}
      {isSubscribed &&
        lockedBeaches.map((beach) => (
          <BeachCard
            key={beach.name}
            beach={beach}
            windData={windData}
            isFirst={false}
            isLocked={false}
            isLoading={isLoading}
          />
        ))}
    </div>
  );
}
