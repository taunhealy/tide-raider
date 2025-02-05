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
}: BeachGridProps) {
  const { isSubscribed } = useSubscription();

  // Show only first 3 beaches for non-subscribed users
  const displayedBeaches = isSubscribed ? beaches : beaches.slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-[16px]">
      {beaches.map((beach, index) => (
        <BeachCard
          key={beach.name}
          beach={beach}
          windData={windData}
          isFirst={index === 0}
          isLoading={isLoading}
          index={index}
        />
      ))}
    </div>
  );
}
