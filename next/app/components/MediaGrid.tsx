"use client";

import { getMediaGridItems } from "@/app/lib/mediaUtils";
import { useState } from "react";
import { getVideoThumbnail } from "@/app/lib/videoUtils";
import dynamic from "next/dynamic";
import { Beach } from "@/app/types/beaches";
import { useSession } from "next-auth/react";
import { Ad } from "@/app/types/ads";
import { useQuery } from "@tanstack/react-query";
import { AD_CATEGORIES } from "@/app/lib/advertising/constants";

interface MediaGridProps {
  videos?: { url: string; title: string; platform: "youtube" | "vimeo" }[];
  beach: Beach;
  name?: string;
}

function MediaGridBase({ videos, beach }: MediaGridProps) {
  const { data: session } = useSession();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fetch ads for this beach
  const { data: ads = [] } = useQuery<Ad[]>({
    queryKey: ["ads", beach.id],
    queryFn: async () => {
      const response = await fetch(`/api/advertising/ads?beachId=${beach.id}`);
      if (!response.ok) throw new Error("Failed to fetch ads");
      return response.json();
    },
  });

  const { items, shownAdClientIds } = getMediaGridItems(
    videos,
    beach.coffeeShop,
    beach,
    ads
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {items.map((item, index) => {
          // Coffee Shop
          if ("type" in item && item.type === "coffeeShop") {
            const isAd = "isAd" in item && item.isAd;
            const url =
              "url" in item && item.url
                ? item.url
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${item.name}, ${beach.region}`
                  )}`;

            return (
              <a
                key={`coffee-${index}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center group"
              >
                <div className="text-center p-4">
                  <h3 className="font-medium text-sm mb-0.5 font-primary">
                    {item.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-primary">
                    {AD_CATEGORIES.COFFEE_SHOP.emoji} Coffee Shop
                  </span>
                  {isAd && (
                    <span className="text-xs text-gray-400 block font-primary">
                      Sponsored
                    </span>
                  )}
                </div>
              </a>
            );
          }

          // Shaper
          if ("type" in item && item.type === "shaper") {
            const isAd = "isAd" in item && item.isAd;
            const url =
              "url" in item && item.url
                ? item.url
                : `https://www.google.com/search?q=${encodeURIComponent(
                    `${item.name} surfboard shaper`
                  )}`;

            return (
              <a
                key={`shaper-${index}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center group"
              >
                <div className="text-center p-4">
                  <h3 className="font-medium text-sm mb-0.5 font-primary">
                    {item.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-primary">
                    {AD_CATEGORIES.SHAPER.emoji} Shaper
                  </span>
                  {isAd && (
                    <span className="text-xs text-gray-400 block font-primary">
                      Sponsored
                    </span>
                  )}
                </div>
              </a>
            );
          }

          // Beer
          if ("type" in item && item.type === "beer") {
            const isAd = "isAd" in item && item.isAd;
            const url =
              "url" in item && item.url
                ? item.url
                : `https://www.google.com/search?q=${encodeURIComponent(
                    `${item.name} beer`
                  )}`;

            return (
              <a
                key={`beer-${index}`}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center group"
              >
                <div className="text-center p-4">
                  <h3 className="font-medium text-sm mb-0.5 font-primary">
                    {item.name}
                  </h3>
                  <span className="text-xs text-gray-500 font-primary">
                    {AD_CATEGORIES.BEER.emoji} Beer
                  </span>
                  {isAd && (
                    <span className="text-xs text-gray-400 block font-primary">
                      Sponsored
                    </span>
                  )}
                </div>
              </a>
            );
          }

          // Video
          return (
            <a
              key={`video-${index}`}
              href={"url" in item ? item.url : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-video rounded-lg overflow-hidden group"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Thumbnail */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${getVideoThumbnail(
                    "url" in item && item.url ? item.url : "",
                    "platform" in item && item.platform
                      ? item.platform
                      : "youtube"
                  )})`,
                }}
              />

              {/* Overlay */}
              <div
                className="
                absolute inset-0 bg-[var(--color-brand)]
                transition-opacity duration-300 ease-in-out border-4
                opacity-0 group-hover:opacity-100
              "
              />

              {/* Play Icon */}
              <div
                className="
                absolute inset-0 flex items-center justify-center
                transition-all duration-300 ease-in-out
                opacity-100 scale-100
                md:opacity-0 md:scale-90 group-hover:md:opacity-100 group-hover:md:scale-100
              "
              >
                <div className="w-12 h-12 rounded-full bg-[var(--color-tertiary)] flex items-center justify-center border-2 border-[var(--color-play-icon-border)]">
                  <svg
                    className="w-6 h-6 text-black ml-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>

              {/* Title Overlay */}
              <div
                className="
                absolute bottom-0 left-0 right-0
                bg-gradient-to-t from-black/60 to-transparent
                p-4
                transform translate-y-full transition-transform duration-300
                group-hover:translate-y-0
              "
              >
                <h3 className="text-white text-sm font-medium font-primary">
                  {"title" in item ? item.title : "Watch video"}
                </h3>
              </div>
            </a>
          );
        })}
      </div>
    </>
  );
}

// Export a client-only version of the component
export const MediaGrid = dynamic(() => Promise.resolve(MediaGridBase), {
  ssr: false,
});
