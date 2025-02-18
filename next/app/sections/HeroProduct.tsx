"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { beachData } from "../types/beaches";
import {
  formatConditionsResponse,
  isBeachSuitable,
  getScoreDisplay,
  getConditionReasons,
} from "../lib/surfUtils";
import type { WindData } from "../types/wind";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";
import gsap from "gsap";

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
  const [selectedBeach, setSelectedBeach] = useState(FEATURED_BEACHES[0]);
  const [surfData, setSurfData] = useState<{ [key: string]: WindData }>({});
  const [sliderIndex, setSliderIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [cardsPerView, setCardsPerView] = useState(1);

  const beaches = beachData.filter((beach) =>
    FEATURED_BEACHES.includes(beach.id)
  );
  const currentBeach = beachData.find((beach) => beach.id === selectedBeach);

  const imageRef = useRef(null);

  useEffect(() => {
    async function fetchSurfData() {
      try {
        setIsLoading(true);
        const regions = [...new Set(beaches.map((beach) => beach.region))];

        // Fetch all regions in parallel with a single Promise.all
        const regionData = await Promise.all(
          regions.map(async (region) => {
            const response = await fetch(
              `/api/surf-conditions?region=${encodeURIComponent(region)}`,
              {
                next: {
                  revalidate: 3600, // Revalidate every hour
                },
              }
            );
            if (!response.ok) throw new Error(`Failed to fetch ${region} data`);
            const data = await response.json();
            return { region, data };
          })
        );

        const beachConditions: { [key: string]: WindData } = {};
        beaches.forEach((beach) => {
          const regionCondition = regionData.find(
            (r) => r.region === beach.region
          );
          if (regionCondition) {
            beachConditions[beach.id] = regionCondition.data;
          }
        });

        setSurfData(beachConditions);
      } catch (error) {
        console.error("Error fetching surf data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSurfData();
  }, []);

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
  }, [currentBeach]); // Re-run when beach changes

  useEffect(() => {
    const updateCardsPerView = () => {
      setCardsPerView(window.innerWidth < 768 ? 1 : 3);
    };
    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  const getBeachScore = (beach: typeof currentBeach) => {
    if (!beach || !surfData[beach.id]) return null;
    return isBeachSuitable(beach, surfData[beach.id]);
  };

  const maxIndex = Math.max(0, beaches.length - cardsPerView);

  const handlePrevious = () => {
    setSliderIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setSliderIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="bg-[var(--color-bg-secondary)] section-padding mb-6">
      <div className="heading-3 mb-12 md:mb-24">
        <h3>Daily Spot Ratings</h3>
        <h5 className="text-large">Explore beyond your regular surf break.</h5>
      </div>

      <div className="slider-section container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12">
          {/* Slider Section */}
          <div className="w-full lg:w-1/3">
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
                            onClick={() => setSelectedBeach(beach.id)}
                            className={`w-full rounded-lg overflow-hidden transition-all duration-300
                              ${selectedBeach === beach.id ? "bg-[var(--color-tertiary)]" : "bg-white/5 hover:bg-white/10"}
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
              <div className="mt-4 md:mt-12 bg-white rounded-lg md:rounded-xl p-3 md:p-4 shadow-sm border border-gray-100 max-w-[640px] mx-auto lg:mx-0 pl-6 md:pl-8">
                <h3 className="font-primary text-sm md:text-base font-semibold mb-2 mt-4">
                  Optimal Conditions
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 min-h-[240px] md:min-h-[320px]">
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
                    ) : currentBeach && surfData[currentBeach.id] ? (
                      <ul className="space-y-2">
                        {getConditionReasons(
                          currentBeach,
                          surfData[currentBeach.id],
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
          <div className="w-full lg:w-2/3 relative">
            {isLoading ? (
              // Loading skeleton for right side
              <div className="animate-pulse">
                <div className="h-[540px] bg-gray-200 rounded-2xl mb-6" />
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/4" />
                  <div className="h-20 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ) : (
              <div className="relative h-[240px] md:h-[440px] lg:h-[540px] mb-6 rounded-2xl overflow-hidden">
                {currentBeach?.image && (
                  <>
                    <div className="absolute inset-0">
                      <Image
                        ref={imageRef}
                        src={currentBeach.image}
                        alt={currentBeach.name}
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

                    <div className="absolute bottom-3 md:bottom-5 left-3 md:left-6 right-3 md:right-6">
                      <div className="flex flex-col gap-3 md:gap-6">
                        <div className="w-full md:w-1/2">
                          {currentBeach && surfData[currentBeach.id] && (
                            <div className="bg-white/5 backdrop-blur-sm p-2 md:p-4 rounded-xl border border-white/20">
                              <div className="gap-1.5 md:gap-2 mb-2 md:mb-4">
                                <span className="text-sm md:text-base font-medium text-white">
                                  Today's Rating
                                </span>
                                <span className="text-base md:text-lg bg-[var(--color-tertiary)] px-2.5 py-1 rounded-lg shadow-sm">
                                  {(() => {
                                    const score = getBeachScore(currentBeach);
                                    const display = score
                                      ? getScoreDisplay(score.score)
                                      : null;
                                    const conditions =
                                      surfData[currentBeach.id];

                                    return display?.emoji;
                                  })()}
                                </span>
                              </div>
                              <p className="text-xs md:text-sm mb-4 md:mb-6 text-white/80">
                                {(() => {
                                  const score = getBeachScore(currentBeach);
                                  const display = score
                                    ? getScoreDisplay(score.score)
                                    : null;
                                  const conditions = surfData[currentBeach.id];

                                  return display?.description;
                                })()}
                              </p>
                              <div className="space-y-1.5 md:space-y-3 text-[10px] md:text-xs bg-black/20 rounded-md p-3 md:p-4">
                                <p className="flex items-center gap-2 text-white/90">
                                  <span
                                    className="inline-flex"
                                    title={`Wind Speed: ${surfData[currentBeach.id].wind?.speed < 5 ? "Light" : surfData[currentBeach.id].wind?.speed < 12 ? "Moderate" : surfData[currentBeach.id].wind?.speed < 20 ? "Strong" : "Very Strong"}`}
                                  >
                                    {getWindEmoji(
                                      surfData[currentBeach.id].wind?.speed
                                    )}
                                  </span>
                                  <span className="font-medium font-primary">
                                    {surfData[currentBeach.id].wind?.direction}{" "}
                                    @ {surfData[currentBeach.id].wind?.speed}
                                    km/h
                                  </span>
                                </p>
                                <p className="flex items-center gap-2 text-white/90 font-primary">
                                  <span
                                    className="inline-flex font-primary"
                                    title={`Swell Height: ${surfData[currentBeach.id].swell?.height < 0.5 ? "Flat" : surfData[currentBeach.id].swell?.height < 1 ? "Small" : surfData[currentBeach.id].swell?.height < 2 ? "Medium" : "Large"}`}
                                  >
                                    {getSwellEmoji(
                                      surfData[currentBeach.id].swell?.height
                                    )}
                                  </span>
                                  <span className="font-medium font-primary">
                                    {surfData[currentBeach.id].swell?.height}m @{" "}
                                    {surfData[currentBeach.id].swell?.period}s
                                  </span>
                                </p>
                                <p className="flex items-center gap-2 text-white/90 font-primary">
                                  <span
                                    className="inline-flex font-primary"
                                    title={`Swell Direction: ${surfData[currentBeach.id].swell?.direction}`}
                                  >
                                    {getDirectionEmoji(
                                      surfData[currentBeach.id].swell
                                        ?.direction || 0
                                    )}
                                  </span>
                                  <span className="font-medium font-primary">
                                    {surfData[currentBeach.id].swell?.direction}
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
    </section>
  );
}
