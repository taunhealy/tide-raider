"use client";

import { useState, useEffect } from "react";
import { Ad } from "@/app/types/ads";
import { AD_CATEGORIES } from "@/app/lib/advertising/constants";

interface RegionalSidebarProps {
  selectedRegion: string;
  ads: Ad[];
}

export default function RegionalSidebar({
  selectedRegion,
  ads,
}: RegionalSidebarProps) {
  const [filteredAds, setFilteredAds] = useState<
    (Ad | { id: string; category: string; isPlaceholder: true })[]
  >([]);

  useEffect(() => {
    if (!selectedRegion) return;

    // Filter ads based on selected region and category
    const regionAds =
      ads?.filter((ad) => {
        // Check if the ad's regionId matches the selected region
        return ad.regionId === selectedRegion;
      }) ?? [];

    // Group ads by category and select one from each
    const categorizedAds = Object.keys(AD_CATEGORIES).reduce(
      (acc, category) => {
        const categoryAds = regionAds.filter((ad) => ad.category === category);
        if (categoryAds.length > 0) {
          // Rotate ads daily using timestamp
          const dayTimestamp = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
          const selectedIndex = dayTimestamp % categoryAds.length;
          acc.push(categoryAds[selectedIndex]);
        } else {
          // Add placeholder for empty category
          acc.push({
            id: `placeholder-${category}`,
            category,
            isPlaceholder: true,
          });
        }
        return acc;
      },
      [] as (Ad | { id: string; category: string; isPlaceholder: true })[]
    );

    setFilteredAds(categorizedAds);
  }, [selectedRegion, ads]);

  if (!selectedRegion) return null;

  return (
    <aside className="hidden lg:block w-64 space-y-4 flex-shrink-0">
      {filteredAds.map((ad) => {
        if ("isPlaceholder" in ad) {
          return (
            <a
              key={ad.id}
              href="/advertising"
              className="block bg-[var(--color-bg-primary)] rounded-lg p-6 text-center hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <p className="text-small mb-2 font-primary">
                {AD_CATEGORIES[ad.category as keyof typeof AD_CATEGORIES].label}{" "}
                in {selectedRegion}?
              </p>
              <p className="heading-7 text-[var(--color-text-secondary)] font-primary">
                Sponsor this space
              </p>
            </a>
          );
        }

        return (
          <a
            key={ad.id}
            href={ad.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[var(--color-bg-primary)] rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200"
          >
            <h3 className="heading-7 mb-2 font-primary">
              {ad.title || ad.companyName}
            </h3>
            <p className="text-main font-primary">
              {AD_CATEGORIES[ad.category as keyof typeof AD_CATEGORIES].label}
            </p>
          </a>
        );
      })}
    </aside>
  );
}
