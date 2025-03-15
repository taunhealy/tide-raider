"use client";

import { getVideoThumbnail } from "@/app/lib/videoUtils";
import { Beach } from "@/app/types/beaches";
import { useSession } from "next-auth/react";
import { Ad, Service } from "@/app/types/ads";
import { useQuery } from "@tanstack/react-query";
import { AD_CATEGORIES } from "@/app/lib/advertising/constants";
import dynamic from "next/dynamic";

interface MediaGridProps {
  videos?: { url: string; title: string; platform: "youtube" | "vimeo" }[];
  beach: Beach;
}

function MediaGridBase({ videos = [], beach }: MediaGridProps) {
  const { data: ads = [] } = useQuery<Ad[]>({
    queryKey: ["ads", beach.id],
    queryFn: async () => {
      const response = await fetch(`/api/advertising/ads?beachId=${beach.id}`);
      if (!response.ok) throw new Error("Failed to fetch ads");
      const data = await response.json();
      return Array.isArray(data.ads) ? data.ads : [];
    },
  });

  // Prepare local services (coffee shops, shapers, etc.)
  const services = [
    ...(beach.coffeeShop || []).map((shop) => ({
      type: "coffee_shop",
      name: shop.name,
      category: "Coffee Shop",
      url: undefined,
      isAd: false,
    })),
    ...(beach.shaper || []).map((shaper) => ({
      type: "shaper",
      name: shaper.name,
      category: "Shaper",
      url: shaper.url,
      isAd: false,
    })),
    ...(beach.beer || []).map((beer) => ({
      type: "beer",
      name: beer.name,
      category: "Beer",
      url: beer.url,
      isAd: false,
    })),
    // Add ads with consistent structure
    ...ads.map((ad) => ({
      type: ad.category,
      name: ad.title || ad.companyName,
      category:
        AD_CATEGORIES[ad.category as keyof typeof AD_CATEGORIES]?.label ||
        ad.category,
      url: ad.linkUrl,
      isAd: true,
      adId: ad.id,
    })),
  ];

  if (!videos.length && !services.length) return null;

  return (
    <div className="space-y-6">
      {/* Videos Grid */}
      {videos.length > 0 && (
        <div className="border border-[var(--color-border-light)] rounded-lg p-5">
          <h2 className="text-base font-medium font-primary text-[var(--color-text-primary)] mb-4">
            Videos
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {videos.map((video, index) => (
              <a
                key={`video-${index}`}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative aspect-video rounded-lg overflow-hidden group border border-[var(--color-border-light)] hover:border-[var(--color-border-medium)] transition-all duration-200"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${getVideoThumbnail(video.url, video.platform)})`,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-60 group-hover:opacity-75" />
                <div className="absolute inset-0 flex items-center justify-center opacity-90 scale-95 group-hover:scale-100">
                  <div className="w-12 h-12 rounded-full bg-[var(--color-tertiary)] flex items-center justify-center shadow-lg">
                    <svg
                      className="w-5 h-5 text-white ml-0.5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3.5">
                  <h3 className="text-white text-sm font-medium font-primary line-clamp-2 drop-shadow-lg">
                    {video.title || "Watch video"}
                  </h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Services Grid */}
      {services.length > 0 && (
        <div className="border border-[var(--color-border-light)] rounded-lg p-5">
          <h2 className="text-base font-medium font-primary text-[var(--color-text-primary)] mb-4">
            Local Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {services.map((service, index) => {
              // Get emoji based on service type
              let emoji = "🏄‍♂️";
              if (service.type === "coffee_shop") emoji = "☕";
              if (service.type === "shaper") emoji = "🛠️";
              if (service.type === "beer") emoji = "🍺";

              return (
                <a
                  key={`service-${index}`}
                  href={service.url || "/advertising"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`
                    block 
                    bg-[var(--color-bg-primary)] 
                    rounded-lg 
                    p-6 
                    hover:bg-gray-50 
                    transition-colors 
                    ${
                      service.isAd
                        ? "border border-[var(--color-border-light)] hover:border-[var(--color-border-medium)]"
                        : "border border-gray-200"
                    }
                  `}
                  onClick={(e) => {
                    // Stop propagation to prevent opening the BeachDetailsModal
                    e.stopPropagation();

                    if (service.isAd && (service as any).adId) {
                      fetch("/api/advertising/track", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          type: "click",
                          adId: (service as any).adId,
                          beachId: beach.id,
                        }),
                      }).catch(console.error);
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-1.5">
                      <span>{emoji}</span>
                      <span className="text-sm font-primary font-medium text-gray-600">
                        {service.category}
                      </span>
                    </div>
                  </div>

                  <h3 className="heading-7 font-primary font-semibold text-gray-900 mb-1">
                    {service.name}
                  </h3>

                  <p className="text-sm font-primary text-gray-500 mb-3">
                    {beach.region}
                  </p>

                  <div className="h-px bg-gray-100 my-3"></div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs font-primary text-[var(--color-text-secondary)] hover:underline">
                      View details
                    </span>

                    {service.isAd && (
                      <span className="text-xs font-primary text-gray-400">
                        Ad
                      </span>
                    )}
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Export a client-only version of the component
export const MediaGrid = dynamic(() => Promise.resolve(MediaGridBase), {
  ssr: false,
});
