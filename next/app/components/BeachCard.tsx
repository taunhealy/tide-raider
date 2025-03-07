import type { Beach } from "@/app/types/beaches";
import type { WindData, WindDataProp } from "@/app/types/wind";
import { useSubscription } from "@/app/context/SubscriptionContext";
import {
  isBeachSuitable,
  getScoreDisplay,
  getConditionReasons,
} from "@/app/lib/surfUtils";
import { useHandleSubscribe } from "@/app/hooks/useHandleSubscribe";
import { useState, useEffect, useMemo } from "react";
import { InfoIcon, Search, Eye } from "lucide-react";
import BeachDetailsModal from "@/app/components/BeachDetailsModal";
import { useRouter, useSearchParams } from "next/navigation";
import GoogleMapsButton from "@/app/components/GoogleMapsButton";
import {} from "@/app/lib/videoUtils";
import Image from "next/image";
import {
  DEFAULT_PROFILE_IMAGE,
  WAVE_TYPE_ICONS,
  WaveType,
} from "@/lib/constants";
import { MediaGrid } from "@/app/components/MediaGrid";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { LogEntry } from "@/app/types/questlogs";
import Link from "next/link";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { ValidRegion } from "@/lib/regions";
import { VALID_REGIONS } from "@/lib/regions";

interface BeachCardProps {
  beach: Beach;
  windData: WindDataProp;
  isFirst?: boolean;
  isLocked?: boolean;
  isLoading?: boolean;
  index: number;
}

const ConditionsSkeleton = () => (
  <div className="text-sm flex flex-col gap-2 animate-pulse">
    <div className="h-5 w-32 bg-gray-200 rounded mb-2"></div>
    <ul className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <li key={i} className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </li>
      ))}
    </ul>
  </div>
);

export default function BeachCard({
  beach,
  windData,
  isFirst = false,
  isLoading = false,
  index,
}: BeachCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSubscribed, hasActiveTrial } = useSubscription();
  const handleSubscribe = useHandleSubscribe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWaveTypeHint, setShowWaveTypeHint] = useState(false);
  const [showRatingHint, setShowRatingHint] = useState(false);
  const queryClient = useQueryClient();

  // Update the loading state logic
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  useEffect(() => {
    // Only set loading if beach data is valid
    if (beach && beach.name) {
      const timer = setTimeout(() => {
        setIsLocalLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setIsLocalLoading(true);
    }
  }, [beach]);

  // Update the suitability calculation
  const suitability = useMemo(() => {
    if (!windData) return null;
    return isBeachSuitable(beach, windData);
  }, [beach, windData]);

  const isRegionSupported = VALID_REGIONS.includes(beach.region as ValidRegion);
  const shouldBeLocked =
    !isSubscribed && !hasActiveTrial && (suitability?.score ?? 0) >= 3;

  // Check URL params for modal state
  useEffect(() => {
    const beachParam = searchParams.get("beach");
    if (beachParam === beach.name && !shouldBeLocked) {
      setIsModalOpen(true);
    }
  }, [searchParams, beach.name, shouldBeLocked]);

  const CHARACTER_LIMIT = 90;
  const truncatedDescription =
    beach.description.length > CHARACTER_LIMIT
      ? beach.description.substring(0, CHARACTER_LIMIT) + "..."
      : beach.description;

  const handleOpenModal = (e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (shouldBeLocked) return;

    // Prevent default browser behavior
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("beach", beach.name);

    // Use replace instead of push to avoid adding to history
    router.replace(`?${params.toString()}`, { scroll: false });
    setIsModalOpen(true);
  };

  const handleCloseModal = (e?: React.MouseEvent<HTMLElement, MouseEvent>) => {
    // Prevent default browser behavior
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const params = new URLSearchParams(searchParams.toString());
    params.delete("beach");

    // Use replace instead of push to avoid adding to history
    router.replace(`?${params.toString()}`, { scroll: false });
    setIsModalOpen(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if text is selected
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    if (shouldBeLocked) return;
    handleOpenModal();
  };

  // Get sessions from existing cache
  const recentEntries = queryClient.getQueryData<LogEntry[]>([
    "recentQuestEntries",
  ]);
  const beachSessions = Array.isArray(recentEntries)
    ? recentEntries.filter(
        (entry) => entry.beachName.toLowerCase() === beach.name.toLowerCase()
      )
    : [];

  const scoreDisplay = getScoreDisplay(suitability?.score || 0);

  const renderRating = () => {
    if (!isRegionSupported) {
      return (
        <div className="text-sm text-[var(--color-text-secondary)]">
          Surf forecasts coming soon for {beach.region}
        </div>
      );
    }

    // Existing rating display logic
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <Star
            key={rating}
            className={cn(
              "w-4 h-4",
              rating <= (suitability?.score ?? 0)
                ? "text-[var(--color-tertiary)] fill-current"
                : "text-gray-300"
            )}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      {/* Main Card Container */}
      <div
        onClick={handleCardClick}
        className={`
          group
          bg-[var(--color-bg-primary)]
          rounded-lg 
          p-[24px] md:p-[32px]
          border
          border-[var(--color-border-light)]
          transition-all
          duration-300
          relative
          w-full
          h-full
          min-h-[280px] md:min-h-[360px]
          ${
            !shouldBeLocked &&
            "hover:border-[var(--color-border-medium)] hover:shadow-sm cursor-pointer"
          } 
          ${suitability?.suitable ? "bg-brand-secondary" : ""}
        `}
      >
        {isLocalLoading || isLoading ? (
          <ConditionsSkeleton />
        ) : (
          <div className="flex flex-col gap-[24px] md:gap-[32px]">
            {/* Beach Information Header */}
            <div className="flex items-center justify-between">
              {/* Wave Type Icon and Beach Details */}
              <div className="flex items-center gap-2 md:gap-3">
                {/* Wave Type Icon with Tooltip */}
                <div
                  className="relative min-w-[40px] w-10 h-10 md:min-w-[54px] md:w-14 md:h-14 rounded-full overflow-hidden bg-gray-100 border border-gray-200"
                  onMouseEnter={() => setShowWaveTypeHint(true)}
                  onMouseLeave={() => setShowWaveTypeHint(false)}
                >
                  <Image
                    src={
                      beach.waveType &&
                      WAVE_TYPE_ICONS[beach.waveType as WaveType]
                        ? WAVE_TYPE_ICONS[beach.waveType as WaveType]
                        : WAVE_TYPE_ICONS["Beach Break"]
                    }
                    alt={`${beach.waveType || "Default"} icon`}
                    fill
                    className="object-cover"
                  />
                  {beach.waveType && (
                    <div
                      className={`
                        absolute bottom-full left-1/2 -translate-x-1/2 mb-2
                        bg-black bg-opacity-50 
                        px-3 py-1 rounded-md 
                        text-white text-sm 
                        transition-all duration-300 ease-in-out
                        whitespace-nowrap
                        ${
                          showWaveTypeHint
                            ? "opacity-100 translate-y-0"
                            : "opacity-0 translate-y-2"
                        }
                      `}
                    >
                      {beach.waveType}
                    </div>
                  )}
                </div>

                {/* Locked/Unlocked Beach Information */}
                {shouldBeLocked ? (
                  <div className="flex items-center gap-[8px]">
                    <svg
                      className="w-5 h-5 text-[var(--color-text-tertiary)]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-[var(--color-text-tertiary)] heading-6">
                      Members Only
                    </span>
                  </div>
                ) : (
                  <>
                    <div>
                      <h4 className="text-base sm:text-[21px] font-primary font-semibold text-[var(--color-text-primary)] flex items-center gap-2">
                        {beach.name}
                        {windData?.windSpeed && windData.windSpeed > 25 && (
                          <span title="Strong winds">🌪️</span>
                        )}
                        {beach.sharkAttack.hasAttack && (
                          <span title="At least 1 shark attack reported">
                            {beach.sharkAttack.incidents?.some(
                              (incident) =>
                                new Date(incident.date).getTime() >
                                new Date().getTime() -
                                  5 * 365 * 24 * 60 * 60 * 1000
                            )
                              ? "🦈 ⋆༺𓆩☠︎︎𓆪༻⋆🪦"
                              : "🦈"}
                          </span>
                        )}
                      </h4>
                      <h6 className="text-[12px] sm:text-[12px] font-primary text-[var(--color-text-secondary)]">
                        {beach.region}
                      </h6>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              {!shouldBeLocked && (
                <div className="flex items-center gap-1 md:gap-2">
                  <GoogleMapsButton
                    coordinates={beach.coordinates}
                    name={beach.name}
                    region={beach.region}
                    location={beach.location}
                    className="hidden md:flex"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal();
                    }}
                    className="p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <InfoIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Suitability Rating and Conditions */}
            <div className="font-medium">
              {isLoading ? (
                <ConditionsSkeleton />
              ) : windData ? (
                // Show actual conditions when windData is available
                <div className="flex flex-col gap-1 md:gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="flex items-center gap-2 relative px-2 py-1"
                      onMouseEnter={() => setShowRatingHint(true)}
                      onMouseLeave={() => setShowRatingHint(false)}
                    >
                      <div>{scoreDisplay.emoji}</div>
                      <div className="text-amber-400">{scoreDisplay.stars}</div>
                      <div
                        className={`
                        absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 
                        px-3 py-1 bg-gray-900 text-white text-sm rounded-md 
                        transition-opacity whitespace-nowrap
                        ${showRatingHint ? "opacity-100" : "opacity-0"}
                      `}
                      >
                        {scoreDisplay.description}
                      </div>
                    </div>
                  </div>

                  {/* Current Conditions */}
                  <div className="text-sm flex flex-col gap-1 md:gap-2">
                    <h6 className="text-sm md:text-base font-primary">
                      Current Conditions:
                    </h6>
                    <ul className="space-y-2">
                      {getConditionReasons(
                        beach,
                        windData,
                        false
                      ).optimalConditions.map((condition, index, array) => (
                        <li
                          key={index}
                          className={`flex items-center gap-2 md:gap-4 pb-1 md:pb-2 ${
                            index !== array.length - 1
                              ? "border-b border-gray-200"
                              : ""
                          }`}
                        >
                          <span className="inline-flex items-center justify-center w-4 h-4">
                            {condition.isMet ? (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4 text-[var(--color-tertiary)]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path
                                  d="M20 6L9 17L4 12"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4 text-[var(--color-text-secondary)]"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path
                                  d="M18 6L6 18M6 6l12 12"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          <span
                            className={`text-xs md:text-sm ${
                              condition.isMet
                                ? "text-gray-800"
                                : "text-gray-500"
                            }`}
                          >
                            <span className="font-medium md:font-semibold font-primary">
                              {condition.text.split(":")[0]}:
                            </span>{" "}
                            <span className="font-normal font-primary">
                              {condition.text.split(":")[1]}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                // Show optimal conditions when no windData is available
                <div className="text-sm flex flex-col gap-1 md:gap-2">
                  <p className="text-sm md:text-base font-semibold font-primary">
                    Optimal Conditions:
                  </p>
                  <ul className="space-y-1">
                    <li className="text-main flex items-center font-primary gap-2 text-gray-600 text-main mb-1">
                      <span className="font-medium font-primary">
                        Wind Direction:
                      </span>{" "}
                      {beach.optimalWindDirections.join(", ")}
                    </li>
                    <li className="text-main flex items-center font-primary gap-2 text-gray-600 text-main mb-1">
                      <span className="font-medium font-primary">
                        Swell Direction:
                      </span>{" "}
                      {beach.optimalSwellDirections.min}° -{" "}
                      {beach.optimalSwellDirections.max}°
                    </li>
                    <li className="text-main flex items-center gap-2 font-primary text-gray-600 text-main mb-1">
                      <span className="font-medium font-primary">
                        Wave Size:
                      </span>{" "}
                      {beach.swellSize.min}m - {beach.swellSize.max}m
                    </li>
                    <li className="text-main flex items-center gap-2 font-primary text-gray-600 text-main mb-1">
                      <span className="font-medium font-primary">
                        Swell Period:
                      </span>{" "}
                      {beach.idealSwellPeriod.min}s -{" "}
                      {beach.idealSwellPeriod.max}s
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Media Grid - Now inside the card */}
            {!shouldBeLocked && beach.videos && beach.videos.length > 0 && (
              <div className="mt-2">
                <MediaGrid beach={beach} videos={beach.videos} />
              </div>
            )}
          </div>
        )}

        {/* Quick View Button */}
        {!shouldBeLocked && (
          <div
            className="
            absolute 
            bottom-2 
            right-2 
            md:bottom-3 
            md:right-3 
            opacity-0 
            group-hover:opacity-100 
            transition-opacity
            bg-gray-50
            p-1.5
            md:p-2
            rounded-full
          "
          >
            <Eye className="w-4 h-4 md:w-5 md:h-5 text-gray-500" />
          </div>
        )}
      </div>

      {/* Modals */}
      {!shouldBeLocked && (
        <BeachDetailsModal
          beach={beach}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isSubscribed={isSubscribed}
          onSubscribe={handleSubscribe}
        />
      )}
    </>
  );
}
