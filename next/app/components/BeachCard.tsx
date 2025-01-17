import type { Beach } from "@/app/types/beaches";
import type { WindData } from "@/app/types/wind";
import { useSubscription } from "../context/SubscriptionContext";
import {
  isBeachSuitable,
  getEmojiDescription,
  getScoreEmoji,
  getConditionReasons,
} from "@/app/lib/surfUtils";
import { useHandleSubscribe } from "@/app/hooks/useHandleSubscribe";
import { useState, useEffect } from "react";
import { InfoIcon, Search, Eye } from "lucide-react";
import BeachDetailsModal from "./BeachDetailsModal";
import { useRouter, useSearchParams } from "next/navigation";
import { Inter } from "next/font/google";
import GoogleMapsButton from "./GoogleMapsButton";
import {
} from "@/app/lib/videoUtils";
import Image from "next/image";
import {
  DEFAULT_PROFILE_IMAGE,
  WAVE_TYPE_ICONS,
  WaveType,
} from "@/app/lib/constants";
import { MediaGrid } from "./MediaGrid";

interface BeachCardProps {
  beach: Beach;
  windData: WindData | null;
  isFirst?: boolean;
  isLocked?: boolean;
}

const inter = Inter({ subsets: ["latin"] });

export default function BeachCard({
  beach,
  windData,
  isFirst = false,
}: BeachCardProps) {
  console.log("BeachCard beach prop:", beach);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSubscribed } = useSubscription();
  const handleSubscribe = useHandleSubscribe();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWaveTypeHint, setShowWaveTypeHint] = useState(false);
  const [showRatingHint, setShowRatingHint] = useState(false);

  const suitability = windData ? isBeachSuitable(beach, windData) : null;
  const shouldBeLocked = !isSubscribed && suitability?.score === 4;

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

  return (
    <>
      {/* Main Card Container */}
      <div
        onClick={handleCardClick}
        className={`
          group
          bg-[var(--color-bg-primary)]
          rounded-lg 
          p-[32px]
          border
          border-[var(--color-border-light)]
          transition-all
          duration-300
          relative
          w-full
          h-full
          min-h-[360px]
          ${!shouldBeLocked && "hover:border-[var(--color-border-medium)] hover:shadow-sm cursor-pointer"} 
          ${suitability?.suitable ? "bg-brand-secondary" : ""}
        `}
      >
        <div className="flex flex-col gap-[32px]">
          {/* Beach Information Header */}
          <div className="flex items-center justify-between">
            {/* Wave Type Icon and Beach Details */}
            <div className="flex items-center gap-3">
              {/* Wave Type Icon with Tooltip */}
              <div
                className="relative min-w-[54px] w-[54px] h-[54px] sm:w-[54px] sm:h-[54px] rounded-full overflow-hidden bg-gray-100 border border-gray-200"
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
                      ${showWaveTypeHint ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
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
                    Premium Spot
                  </span>
                </div>
              ) : (
                <>
                  <div>
                    <h4 className="heading-5 text-[var(--color-text-primary)]">
                      {beach.name}
                    </h4>
                    <h5 className="heading-6 text-[var(--color-text-secondary)]">
                      {beach.region}
                    </h5>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {!shouldBeLocked && (
              <div className="flex items-center gap-2">
                <GoogleMapsButton
                  coordinates={beach.coordinates}
                  name={beach.name}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenModal();
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <InfoIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}
          </div>

          {/* Suitability Rating and Conditions */}
          <div className=" font-medium">
            {suitability && (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div
                    className="flex items-center gap-2 relative px-2 py-1"
                    onMouseEnter={() => setShowRatingHint(true)}
                    onMouseLeave={() => setShowRatingHint(false)}
                  >
                    <div>{getScoreEmoji(suitability.score)}</div>
                    <span className="text-sm">
                      {"⭐".repeat(suitability.score)}
                    </span>
                    <div
                      className={`
                      absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 
                      px-3 py-1 bg-gray-900 text-white text-sm rounded-md 
                      transition-opacity whitespace-nowrap
                      ${showRatingHint ? "opacity-100" : "opacity-0"}
                    `}
                    >
                      {getEmojiDescription(suitability.score)}
                    </div>
                  </div>
                </div>

                {/* Poor Conditions Explanation */}
                {windData && (
                  <div className="text-sm flex flex-col gap-2">
                    <p className="text-main font-semibold">Conditions:</p>
                    <ul className="space-y-1">
                      {getConditionReasons(
                        beach,
                        windData,
                        false
                      ).optimalConditions.map((condition, index) => (
                        <li
                          key={index}
                          className="flex items-center gap-2 text-gray-600 text-main mb-1"
                        >
                          <span className="inline-flex items-center justify-center w-4 h-4">
                            {condition.isMet ? (
                              <svg
                                viewBox="0 0 24 24"
                                className="w-4 h-4 text-[var(--color-brand-tertiary)]"
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
                                className="w-4 h-4 text-red-500"
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
                          {condition.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick View Button */}
        {!shouldBeLocked && (
          <div
            className="
            absolute 
            bottom-3 
            right-3 
            opacity-0 
            group-hover:opacity-100 
            transition-opacity
            bg-gray-50
            p-2
            rounded-full
          "
          >
            <Eye className="w-5 h-5 text-gray-500" />
          </div>
        )}
      </div>

      {/* Modals and Media Grid */}
      {!shouldBeLocked && (
        <BeachDetailsModal
          beach={beach}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          isSubscribed={isSubscribed}
          onSubscribe={handleSubscribe}
        />
      )}

      {!shouldBeLocked && (
        <MediaGrid beach={beach} videos={beach.videos || []} />
      )}
    </>
  );
}
