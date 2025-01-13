import type { Beach } from "../types/beaches";
import type { WindData } from "../types/wind";
import BeachCard from "./BeachCard";
import { useSubscription } from "../context/SubscriptionContext";
import Link from "next/link";
import { getGatedBeaches } from "../lib/surfUtils";

interface BeachGridProps {
  beaches: Beach[];
  windData: WindData | null;
  isBeachSuitable: (beach: Beach, conditions: WindData) => any;
  children?: React.ReactNode;
}

export default function BeachGrid({
  beaches,
  windData,
  isBeachSuitable,
  children,
}: BeachGridProps) {
  const { isSubscribed } = useSubscription();

  const { visibleBeaches, lockedBeaches } = getGatedBeaches(
    beaches,
    windData,
    isSubscribed
  );

  return (
    <div className="grid grid-cols-1 gap-[16px]">
      {/* Visible Spots */}
      {visibleBeaches.map((beach, index) => (
        <BeachCard
          key={beach.name}
          beach={beach}
          windData={windData}
          isFirst={index === 0}
          isLocked={false}
        />
      ))}

      {/* Locked Spots */}
      {!isSubscribed &&
        lockedBeaches.map((beach, index) => (
          <BeachCard
            key={beach.name}
            beach={beach}
            windData={windData}
            isFirst={false}
            isLocked={true}
          />
        ))}

      {/* Subscribed Spots */}
      {isSubscribed &&
        lockedBeaches.map((beach, index) => (
          <BeachCard
            key={beach.name}
            beach={beach}
            windData={windData}
            isFirst={false}
            isLocked={false}
          />
        ))}
    </div>
  );
}
