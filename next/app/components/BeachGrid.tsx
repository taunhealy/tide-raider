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
      {displayedBeaches.map((beach, index) => (
        <BeachCard
          key={beach.name}
          beach={beach}
          windData={windData}
          isFirst={index === 0}
          isLoading={isLoading}
          index={index}
        />
      ))}

      {!isSubscribed && beaches.length > 3 && (
        <div className="bg-[var(--color-bg-primary)] rounded-lg p-[32px] border border-[var(--color-border-light)]">
          <div className="text-center">
            <h6 className="heading-6 text-gray-800 mb-2">Unlock More Spots</h6>
            <p className="text-main text-gray-600 mb-4">
              Subscribe to access all surf spots and detailed conditions
            </p>
            <Link
              href="/pricing"
              className="inline-block px-4 py-2 bg-[var(--color-tertiary)] text-white rounded-lg hover:bg-[var(--color-tertiary)]"
            >
              View Pricing
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
