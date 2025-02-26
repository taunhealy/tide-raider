"use client";

import { getMediaGridItems } from "@/app/lib/mediaUtils";
import { useState } from "react";
import { getVideoThumbnail } from "@/app/lib/videoUtils";
import dynamic from "next/dynamic";
import { Beach } from "@/app/types/beaches";
import { useSession } from "next-auth/react";

interface MediaGridProps {
  videos?: { url: string; title: string; platform: "youtube" | "vimeo" }[];
  beach: Beach;
  name?: string;
}

function MediaGridBase({ videos, beach }: MediaGridProps) {
  const { data: session } = useSession();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { items, shownAdClientIds } = getMediaGridItems(
    videos,
    beach.coffeeShop,
    beach
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {items.map((item, index) => {
          // Coffee Shop
          if ("type" in item && item.type === "coffeeShop") {
            return (
              <a
                key={`coffee-${index}`}
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${beach.coffeeShop?.[0].name}, ${beach.region}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center group"
              >
                <div className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-4">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-white flex items-center justify-center">
                    <svg
                      className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>

                  <h4 className="text-sm sm:text-base text-gray-700 font-semibold group-hover:text-gray-900 transition-colors text-center">
                    {beach.coffeeShop?.[0].name}
                  </h4>
                  <span>
                    <h6 className="text-sm sm:text-base">⚡☕⚡</h6>
                  </span>
                </div>
              </a>
            );
          }

          // Video
          return (
            <a
              key={"url" in item ? item.url : ""}
              href={"url" in item ? item.url : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={getVideoThumbnail(
                  "url" in item ? item.url : "",
                  "platform" in item ? item.platform : "youtube"
                )}
                alt={"title" in item ? item.title : item.name || "Surf video"}
                className="w-full h-full object-cover"
              />
              {/* Brand color overlay */}
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
                <h3 className="text-white text-sm font-medium">
                  {"title" in item ? item.title : item.name || "Watch video"}
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
