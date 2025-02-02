"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { beachData } from "../types/beaches";
import {
  formatConditionsResponse,
  isBeachSuitable,
  getScoreDisplay,
} from "../lib/surfUtils";
import type { WindData } from "../types/wind";
import {
  getWindEmoji,
  getSwellEmoji,
  getDirectionEmoji,
} from "@/app/lib/forecastUtils";

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

  const beaches = beachData.filter((beach) =>
    FEATURED_BEACHES.includes(beach.id)
  );
  const currentBeach = beachData.find((beach) => beach.id === selectedBeach);

  useEffect(() => {
    async function fetchSurfData() {
      try {
        // Get unique regions from featured beaches
        const regions = [...new Set(beaches.map((beach) => beach.region))];

        // Fetch conditions for each region using existing API
        const regionData = await Promise.all(
          regions.map(async (region) => {
            const response = await fetch(
              `/api/surf-conditions?region=${region}`
            );
            if (!response.ok) throw new Error(`Failed to fetch ${region} data`);
            const data = await response.json();
            return { region, data };
          })
        );

        // Create a map of beach ID to its regional conditions
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
      }
    }

    fetchSurfData();
  }, []); // Fetch once when component mounts

  const getBeachScore = (beach: typeof currentBeach) => {
    if (!beach || !surfData[beach.id]) return null;
    return isBeachSuitable(beach, surfData[beach.id]);
  };

  const cardsPerView = 3;
  const maxIndex = Math.max(0, beaches.length - cardsPerView);

  const handlePrevious = () => {
    setSliderIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setSliderIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  return (
    <section className="bg-[var(--color-bg-secondary)] section-padding mb-6">
      <div className="heading-3 mb-24">
        <h3>Daily Spot Ratings</h3>
        <h5 className="text-large">Explore & raid effectively.</h5>
      </div>

      <div className="slider-section container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Slider Section */}
          <div className="md:w-1/3">
            <div className="relative">
              <div className="flex items-center">
                {/* Previous Button */}
                <button
                  onClick={handlePrevious}
                  disabled={sliderIndex === 0}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4"
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

                {/* Cards Container */}
                <div className="flex-1 overflow-hidden mx-2">
                  <div
                    className="flex gap-2 transition-transform duration-300"
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
                            ${
                              selectedBeach === beach.id
                                ? "ring-1 ring-[var(--color-tertiary)]"
                                : "hover:opacity-80"
                            }`}
                        >
                          <div className="relative aspect-video max-w-[340px] rounded-md">
                            <Image
                              src={beach.image}
                              alt={beach.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-left p-1.5">
                            <h3 className="font-primary text-xs font-medium mb-0.5">
                              {beach.name}
                            </h3>
                            <p className="font-primary text-[10px] text-[var(--color-text-secondary)]">
                              {beach.country}
                            </p>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNext}
                  disabled={sliderIndex === maxIndex}
                  className="p-1 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-4 h-4"
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
            </div>
          </div>

          {/* Right side - Image and content */}
          <div className="md:w-2/3 relative">
            {/* Image */}
            <div className="h-[400px] mb-6 overflow-hidden rounded-xl">
              {currentBeach?.image && (
                <Image
                  src={currentBeach.image}
                  alt={currentBeach.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="max-w-[540px] object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
              )}
            </div>

            {/* Surf conditions - Positioned over the beach image */}
            <div className="absolute bottom-6 left-6 right-6 max-w-[360px] rounded-md">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Surf Score */}
                <div className="md:w-1/2">
                  {currentBeach && surfData[currentBeach.id] && (
                    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl">
                      {(() => {
                        const score = getBeachScore(currentBeach);
                        const display = score
                          ? getScoreDisplay(score.score)
                          : null;
                        const conditions = surfData[currentBeach.id];

                        return (
                          <>
                            <div className="flex items-center gap-3 mb-6 max-w-[240px]">
                              <span className="font-primary text-lg font-medium text-white">
                                Today's Rating
                              </span>
                              <span className="text-xl bg-[var(--color-tertiary)] px-3 py-1.5 rounded-lg shadow-sm">
                                {display?.emoji}
                              </span>
                            </div>
                            <p className="font-primary text-sm mb-6 text-white/80">
                              {display?.description}
                            </p>
                            <div className="space-y-3 font-primary text-xs bg-black/20 rounded-md p-4">
                              <p className="flex items-center gap-2 text-white/90">
                                <span
                                  className="inline-flex"
                                  title={`Wind Speed: ${conditions.wind.speed < 5 ? "Light" : conditions.wind.speed < 12 ? "Moderate" : conditions.wind.speed < 20 ? "Strong" : "Very Strong"}`}
                                >
                                  {getWindEmoji(conditions.wind.speed)}
                                </span>
                                <span className="font-medium">
                                  {conditions.wind.direction} @{" "}
                                  {conditions.wind.speed}km/h
                                </span>
                              </p>
                              <p className="flex items-center gap-2 text-white/90">
                                <span
                                  className="inline-flex"
                                  title={`Swell Height: ${conditions.swell.height < 0.5 ? "Flat" : conditions.swell.height < 1 ? "Small" : conditions.swell.height < 2 ? "Medium" : "Large"}`}
                                >
                                  {getSwellEmoji(conditions.swell.height)}
                                </span>
                                <span className="font-medium">
                                  {conditions.swell.height}m @{" "}
                                  {conditions.swell.period}s
                                </span>
                              </p>
                              <p className="flex items-center gap-2 text-white/90">
                                <span
                                  className="inline-flex"
                                  title={`Swell Direction: ${conditions.swell.direction}`}
                                >
                                  {getDirectionEmoji(
                                    parseInt(conditions.swell.direction)
                                  )}
                                </span>
                                <span className="font-medium">
                                  {conditions.swell.direction}
                                </span>
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
