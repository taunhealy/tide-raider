"use client";

import { urlForImage } from "@/app/lib/urlForImage";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Link from "next/link";

import { Heart } from "lucide-react";

interface HeroProps {
  data: {
    heroHeading: string;
    heroSubheading: string;
    heroImage: {
      _type: "image";
      _id: string;
      alt?: string;
      asset: {
        _ref: string;
        _type: "reference";
      };
    };
  };
}

export default function HeroSection({ data }: HeroProps) {
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);
  const textRef = useRef<HTMLDivElement>(null);
  const xRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLSpanElement>(null);
  const buttonBgRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);

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
    <section
      ref={sectionRef}
      className="relative w-full h-[100svh] min-h-[600px] overflow-hidden"
    >
      <div className="relative w-full h-full z-99 max-w-[1440px] mx-auto">
        {/* Neon Hearts */}
        <div className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 flex space-x-2 sm:space-x-3 md:space-x-4 z-20">
          {[1, 2, 3].map((i) => (
            <Heart
              key={i}
              className="w-3 h-3 sm:w-4 sm:h-4 md:w-6 md:h-6 text-brand-3 animate-neon-pulse"
              style={{ animationDelay: `${i * 100}ms` }}
              stroke="currentColor"
              strokeWidth={2.5}
              fill="none"
            />
          ))}
        </div>

        {/* Background image */}
        <div className="absolute inset-0">
          <Image
            src={imageUrl || ""}
            alt={data?.heroImage?.alt || ""}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            ref={imageRef}
          />
        </div>

        {/* Left sidebar text - moved closer to center */}
        <div
          ref={textRef}
          className="absolute left-8 sm:left-12 md:left-[120px] lg:left-[180px] top-1/2 -translate-y-1/2 pr-2 sm:pr-3 md:pr-4"
        >
          <div className="writing-mode-vertical-rl rotate-270 space-y-1.5 sm:space-y-2 md:space-y-4">
            <h2 className="font-primary font-bold text-2xl sm:text-3xl md:text-5xl lg:text-[64px] leading-none tracking-tighter text-white">
              {data?.heroHeading}
            </h2>
            <p className="font-primary font-medium text-xs sm:text-sm md:text-lg lg:text-[20px] leading-none tracking-tight text-white">
              For kicks.
            </p>
          </div>
        </div>

        {/* Game Start Button - moved closer to center */}
        <div className="absolute top-1/2 right-8 sm:right-12 md:right-[120px] lg:right-[180px] -translate-y-1/2 flex flex-col items-start">
          <Link
            href="/raid"
            className="group relative rounded-xl overflow-hidden transition-transform duration-300 hover:scale-110"
          >
            <div
              ref={buttonBgRef}
              className="absolute inset-0 bg-gradient-to-br from-brand-3 to-brand-2 blur-sm group-hover:blur-md transition-all duration-500 ease-in-out"
            />
            <span
              ref={buttonRef}
              className="relative z-20 text-lg sm:text-xl md:text-3xl lg:text-4xl font-primary font-bold tracking-wider text-white 
              px-8 sm:px-10 md:px-20 py-3 sm:py-4 md:py-5 
              inline-block 
              bg-gradient-to-br from-brand-3 to-brand-2
              border border-white/30
              shadow-lg shadow-brand-3/25
              transition-all duration-500 ease-in-out
              group-hover:shadow-xl group-hover:shadow-[var(--color-tertiary)]/20
              origin-center
              animate-bounce-cartoon
              overflow-hidden"
            >
              START
            </span>
          </Link>
          <span
            className="text-sm md:text-base font-primary font-medium text-white/90 mt-3 
            tracking-wider animate-pulse self-start drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
          >
            your journey.
          </span>
        </div>
      </div>
    </section>
  );
}
