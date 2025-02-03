"use client";

import { urlForImage } from "@/app/lib/urlForImage";
import Image from "next/image";
import { useState } from "react";

interface HeroProps {
  data: {
    heroHeading: string;
    heroSubheading: string;
    heroImage: {
      _type: "image";
      _id: string;
      asset: {
        _ref: string;
        _type: "reference";
      };
    };
  };
}

export default function HeroSection({ data }: HeroProps) {
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);

  if (!data) {
    return (
      <section className="relative w-full h-[60vh] md:h-[90vh] md:px-[121.51px] bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <p>Loading hero content...</p>
        </div>
      </section>
    );
  }

  const imageUrl = data?.heroImage?.asset
    ? urlForImage(data.heroImage)?.width(1920).height(1080).url()
    : null;

  return (
    <section className="relative w-full h-[60vh] md:h-[90vh] md:px-[121.51px]">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={data.heroHeading || "Hero background"}
          fill
          priority
          quality={100}
          className="object-cover"
          onLoadingComplete={() => setHeroImageLoaded(true)}
        />
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-[var(--color-tertiary)] opacity-30" />

      {/* Hero content */}
      <div className="absolute inset-0 flex items-end">
        <div className="backdrop-blur-sm bg-gradient-to-r from-black/80 to-[var(--color-tertiary)]/30 px-4 md:pl-[81px] pb-[16px] md:pb-[54px] w-full">
          <h1 className="font-secondary text-white text-[72px] sm:text-[96px] md:text-[210px] leading-[0.9] font-bold uppercase">
            {data?.heroHeading}
          </h1>
        </div>
      </div>
    </section>
  );
}
