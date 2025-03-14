import type { Beach } from "../types/beaches";
import { WindDataProp } from "@/app/types/wind";
import BeachCard from "./BeachCard";
import { useSubscription } from "../context/SubscriptionContext";
import { useAppMode } from "../context/AppModeContext";

interface BeachGridProps {
  beaches: Beach[];
  windData: WindDataProp;
  isBeachSuitable: (
    beach: Beach,
    conditions: WindDataProp
  ) => {
    suitable: boolean;
    score: number;
  };
  isLoading?: boolean;
  onBeachClick: (beach: Beach) => void;
  children?: React.ReactNode;
}

export default function BeachGrid({
  beaches,
  windData,
  isBeachSuitable,
  isLoading = false,
  onBeachClick,
}: BeachGridProps) {
  const { isSubscribed } = useSubscription();
  const { isBetaMode } = useAppMode();

  // In Beta mode, show all beaches regardless of subscription
  // In Paid mode, show only first 3 beaches for non-subscribed users
  const displayedBeaches =
    isBetaMode || isSubscribed ? beaches : beaches.slice(0, 3);

  return (
    <div className="grid grid-cols-1 gap-[16px]">
      {displayedBeaches.map((beach, index) => (
        <BeachCard
          key={beach.name}
          beach={beach}
          windData={windData}
          isFirst={index === 0}
          isLoading={isLoading}
          index={index}
          onClick={() => onBeachClick(beach)}
        />
      ))}
    </div>
  );
}
