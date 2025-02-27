"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import { beachData } from "../types/beaches";
import {
  isBeachSuitable,
  getScoreDisplay,
  getConditionReasons,
  degreesToCardinal,
} from "../lib/surfUtils";
import type { WindData } from "../types/wind";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";
import gsap from "gsap";
import { useQuery } from "@tanstack/react-query";

const FEATURED_BEACHES = [
  "jeffreys-bay",
  "llandudno",
  "ponta-do-ouro",
  "skeleton-bay",
  "cabo-ledo",
  "flame-bowls",
  "elands-bay",
];

export default function HeroProduct() {
  const [selectedBeachId, setSelectedBeachId] = useState(FEATURED_BEACHES[0]);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(1);

  const beaches = beachData.filter((beach) =>
    FEATURED_BEACHES.includes(beach.id)
  );
  const currentBeach = beaches.find((b) => b.id === selectedBeachId);

  // Get all unique regions from featured beaches
  const regions = [...new Set(beaches.map((b) => b.region))];
  const initialRegion = regions[0];

  // Fetch only the initial region's data
  const { data: initialRegionData, isLoading: isInitialLoading } = useQuery({
    queryKey: ["surf-conditions", initialRegion],
    queryFn: async () => {
      try {
        const res = await fetch(
          `/api/surf-conditions?region=${encodeURIComponent(initialRegion)}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      } catch (error) {
        console.error("Error fetching surf conditions:", error);
        return null;
      }
    },
    staleTime: 60 * 1000 * 5, // 5 minutes
  });

  // Fetch data for other regions when needed
  const { data: selectedRegionData, isLoading: isSelectedLoading } = useQuery({
    queryKey: ["surf-conditions", currentBeach?.region],
    queryFn: async () => {
      if (!currentBeach?.region) return null;
      try {
        const res = await fetch(
          `/api/surf-conditions?region=${encodeURIComponent(currentBeach.region)}`
        );
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      } catch (error) {
        console.error("Error fetching surf conditions:", error);
        return null;
      }
    },
    enabled: !!currentBeach?.region,
    staleTime: 60 * 1000 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Merge data from regions
  const surfData = useMemo(() => {
    return beaches.reduce(
      (acc, beach) => {
        if (beach.region === initialRegion) {
          acc[beach.id] = initialRegionData || null;
        } else if (beach.region === currentBeach?.region) {
          acc[beach.id] = selectedRegionData || null;
        } else {
          acc[beach.id] = null;
        }
        return acc;
      },
      {} as Record<string, WindData | null>
    );
  }, [beaches, initialRegionData, selectedRegionData, currentBeach?.region]);

  // Update loading state
  const isLoading = isInitialLoading || isSelectedLoading;

  const imageRef = useRef(null);

  useEffect(() => {
    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scale: 1.09,
        duration: 5,
        ease: "power3.inOut",
        yoyo: true,
        repeat: -3,
      });
    }
  }, [selectedBeachId]); // Re-run when beach changes

  useEffect(() => {
    const updateCardsPerView = () => {
      if (typeof window === "undefined") return;
      setCardsPerView(window.innerWidth < 768 ? 1 : 3);
    };

    // Run once on mount
    updateCardsPerView();

    // Only add listener if in browser
    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateCardsPerView);
      return () => window.removeEventListener("resize", updateCardsPerView);
    }
  }, []);

  const getBeachScore = (beach: typeof selectedBeachId) => {
    if (!beach || !surfData?.[beach]) return null;
    const beachObj = beaches.find((b) => b.id === beach);
    return isBeachSuitable(beachObj!, surfData[beach]);
  };

  const maxIndex = Math.max(0, beaches.length - cardsPerView);

  const handlePrevious = () => {
    setSliderIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setSliderIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  // Find current beach data
  const currentBeachData = surfData[selectedBeachId];

  return (
    <section className="pt-[54px] pb-[81px] md:pt-[54px] md:pb-[121.51px] px-4 md:px-[121.51px] bg-[var(--color-bg-primary)]">
      <div className="container mx-auto max-w-[1440px]">
        <div className="heading-3 mb-8 md:mb-12 lg:mb-24">
          <h3 className="text-2xl md:text-3xl lg:text-4xl">
            Daily Spot Ratings
          </h3>
          <h5 className="text-base md:text-large">
            Explore beyond your regular surf break.
          </h5>
        </div>

        <div className="slider-section px-2 md:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 lg:gap-12">
            {/* Slider Section */}
            <div className="w-full lg:w-2/5">
              <div className="relative">
                {isLoading ? (
                  // Loading skeleton
                  <div className="animate-pulse">
                    <div className="h-[200px] bg-gray-200 rounded-lg mb-4" />
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    {/* Previous Button - Made larger for mobile */}
                    <button
                      onClick={handlePrevious}
                      className="p-2 md:p-1 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"
                    >
                      <svg
                        className="w-6 h-6 md:w-4 md:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    {/* Cards Container - Adjusted spacing */}
                    <div className="flex-1 overflow-hidden mx-1 md:mx-2">
                      <div
                        className="flex gap-1 md:gap-2 transition-transform duration-300"
                        style={{
                          transform: `translateX(-${sliderIndex * (100 / cardsPerView)}%)`,
                        }}
                      >
                        {beaches.map((beach) => (
                          <div
                            key={beach.id}
                            className="flex-shrink-0"
                            style={{ width: `${100 / cardsPerView}%` }}
                          >
                            <button
                              onClick={() => setSelectedBeachId(beach.id)}
                              className={`w-full rounded-lg overflow-hidden transition-all duration-300
                                ${selectedBeachId === beach.id ? "bg-[var(--color-tertiary)]" : "bg-white/5 hover:bg-white/10"}
                                flex flex-col md:block`}
                            >
                              {/* Mobile button text */}
                              <div className="md:hidden p-3 text-center">
                                <h3 className="font-primary text-sm font-medium text-gray-900">
                                  {beach.name}
                                </h3>
                                <p className="font-primary text-xs text-gray-600">
                                  {beach.country}
                                </p>
                              </div>

                              {/* Desktop image card */}
                              <div className="hidden md:block">
                                <div className="relative aspect-video max-w-[340px] rounded-md">
                                  {beach.image ? (
                                    <Image
                                      src={beach.image}
                                      alt={beach.name}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 340px) 100vw, 340px"
                                      quality={75}
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <span className="text-gray-400">
                                        No image available
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-left p-1.5">
                                  <h3 className="font-primary text-sm md:text-xs font-medium mb-0.5">
                                    {beach.name}
                                  </h3>
                                  <p className="font-primary text-xs md:text-[10px] text-[var(--color-text-secondary)]">
                                    {beach.country}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Next Button - Made larger for mobile */}
                    <button
                      onClick={handleNext}
                      disabled={sliderIndex === maxIndex}
                      className="p-2 md:p-1 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50"
                    >
                      <svg
                        className="w-6 h-6 md:w-4 md:h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                )}
                <div className="mt-4 md:mt-8 lg:mt-12 bg-white rounded-lg md:rounded-xl p-3 md:p-4 lg:p-6 shadow-sm border border-gray-100 max-w-[640px] mx-auto lg:mx-0">
                  <h3 className="font-primary text-sm md:text-base lg:text-lg font-semibold mb-2 md:mb-4">
                    Optimal Conditions
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 min-h-[200px] md:min-h-[240px] lg:min-h-[320px]">
                    {/* Current Conditions */}
                    <div className="space-y-2">
                      <h4 className="font-primary text-sm text-gray-500 uppercase tracking-wide"></h4>
                      {isLoading ? (
                        // Skeleton loader for conditions
                        <div className="animate-pulse space-y-4">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="flex items-center gap-4 pb-2 border-b border-gray-200"
                            >
                              <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                              <div className="flex-1">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : currentBeachData && surfData?.[selectedBeachId] ? (
                        <ul className="space-y-2">
                          {getConditionReasons(
                            beaches.find((b) => b.id === selectedBeachId)!,
                            surfData[selectedBeachId]!,
                            false
                          ).optimalConditions.map((condition, index, array) => (
                            <li
                              key={index}
                              className={`flex items-center gap-4 pb-2 ${
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
                                className={`font-primary ${
                                  condition.isMet
                                    ? "text-gray-800"
                                    : "text-gray-500"
                                }`}
                              >
                                <span className="font-medium">
                                  {condition.text.split(":")[0]}:
                                </span>{" "}
                                <span className="font-normal">
                                  {condition.text.split(":")[1]}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-gray-500 italic font-primary">
                          No data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side - Image and content */}
            <div className="w-full lg:w-3/5 relative mt-6 lg:mt-0">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-[240px] md:h-[400px] lg:h-[540px] bg-gray-200 rounded-2xl mb-4 md:mb-6" />
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                    <div className="h-20 bg-gray-200 rounded w-1/3" />
                  </div>
                </div>
              ) : (
                <div className="relative h-[240px] md:h-[400px] lg:h-[540px] mb-4 md:mb-6 rounded-2xl overflow-hidden">
                  {selectedBeachId && surfData?.[selectedBeachId] && (
                    <>
                      <div className="absolute inset-0">
                        <Image
                          ref={imageRef}
                          src={currentBeach?.image || "/fallback-surf.jpg"}
                          alt={currentBeach?.name || "Surf spot"}
                          fill
                          sizes="(max-width: 900px) 20vw, 80vw"
                          className="object-cover"
                          priority
                        />
                      </div>
                      <div className="absolute top-3 md:top-4 left-4 md:left-6">
                        <h2 className="font-primary text-[14px] md:text-[16px] font-medium text-[var(--color-secondary)]">
                          {currentBeach?.name}
                        </h2>
                      </div>

                      <div className="absolute bottom-3 md:bottom-4 lg:bottom-5 left-3 md:left-4 lg:left-6 right-3 md:right-4 lg:right-6">
                        <div className="flex flex-col gap-2 md:gap-4 lg:gap-6">
                          <div className="w-full md:w-2/3 lg:w-1/2">
                            {selectedBeachId && surfData?.[selectedBeachId] && (
                              <div className="bg-white/5 backdrop-blur-sm p-2 md:p-3 lg:p-4 rounded-xl border border-white/20">
                                <div className="gap-1.5 md:gap-2 mb-2 md:mb-3 lg:mb-4 flex items-center space-x-2">
                                  <span className="text-xs md:text-sm lg:text-base font-medium text-white font-primary">
                                    Today's Rating
                                  </span>
                                  <span className="text-base md:text-lg bg-[var(--color-tertiary)] px-2.5 py-1 rounded-lg shadow-sm">
                                    {(() => {
                                      const score =
                                        getBeachScore(selectedBeachId);
                                      const display = score
                                        ? getScoreDisplay(score.score)
                                        : null;
                                      const conditions =
                                        surfData?.[selectedBeachId];

                                      return display?.emoji;
                                    })()}
                                  </span>
                                </div>
                                <p className="text-xs md:text-sm mb-4 md:mb-6 text-white/80">
                                  {(() => {
                                    const score =
                                      getBeachScore(selectedBeachId);
                                    const display = score
                                      ? getScoreDisplay(score.score)
                                      : null;
                                    const conditions =
                                      surfData?.[selectedBeachId];

                                    return display?.description;
                                  })()}
                                </p>
                                <div className="space-y-1.5 md:space-y-3 text-[10px] md:text-xs bg-black/20 rounded-md p-3 md:p-4">
                                  <p className="flex items-center gap-2 text-white/90 font-primary">
                                    <span
                                      className="inline-flex"
                                      title={`Wind Speed: ${surfData?.[selectedBeachId]?.windSpeed < 5 ? "Light" : surfData?.[selectedBeachId]?.windSpeed < 12 ? "Moderate" : surfData?.[selectedBeachId]?.windSpeed < 20 ? "Strong" : "Very Strong"}`}
                                    >
                                      {getWindEmoji(
                                        surfData?.[selectedBeachId]?.windSpeed
                                      )}
                                    </span>
                                    <span className="font-medium font-primary">
                                      {degreesToCardinal(
                                        surfData?.[selectedBeachId]
                                          ?.windDirection
                                      )}{" "}
                                      @ {surfData?.[selectedBeachId]?.windSpeed}
                                      kts
                                    </span>
                                  </p>
                                  <p className="flex items-center gap-2 text-white/90 font-primary">
                                    <span
                                      className="inline-flex font-primary"
                                      title={`Swell Height: ${surfData?.[selectedBeachId]?.swellHeight < 0.5 ? "Flat" : surfData?.[selectedBeachId]?.swellHeight < 1 ? "Small" : surfData?.[selectedBeachId]?.swellHeight < 2 ? "Medium" : "Large"}`}
                                    >
                                      {getSwellEmoji(
                                        surfData?.[selectedBeachId]?.swellHeight
                                      )}
                                    </span>
                                    <span className="font-medium font-primary">
                                      {surfData?.[selectedBeachId]?.swellHeight}
                                      m @{" "}
                                      {surfData?.[selectedBeachId]?.swellPeriod}
                                      s
                                    </span>
                                  </p>
                                  <p className="flex items-center gap-2 text-white/90 font-primary">
                                    <span
                                      className="inline-flex font-primary"
                                      title={`Swell Direction: ${surfData?.[selectedBeachId]?.swellDirection}`}
                                    >
                                      {getDirectionEmoji(
                                        surfData?.[selectedBeachId]
                                          ?.swellDirection || 0
                                      )}
                                    </span>
                                    <span className="font-medium font-primary">
                                      {
                                        surfData?.[selectedBeachId]
                                          ?.swellDirection
                                      }
                                      °
                                    </span>
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
