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

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Only create timeline if elements exist
      if (
        imageRef.current &&
        overlayRef.current &&
        textRef.current &&
        xRef.current
      ) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });

        tl.to([imageRef.current, overlayRef.current], {
          opacity: 0,
          duration: 1,
        });

        gsap.from(textRef.current, {
          opacity: 0,
          y: 50,
          duration: 1.5,
          ease: "power4.out",
        });

        gsap.from(xRef.current, {
          opacity: 0,
          scale: 0.8,
          duration: 1.2,
          delay: 0.3,
        });
      }
    }, sectionRef);

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      ctx.revert();
    };
  }, []);

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
      className="relative w-full h-screen min-h-[600px] overflow-hidden"
    >
      <div className="relative w-full h-full z-99">
        {/* Neon Hearts */}
        <div className="absolute top-8 right-8 flex space-x-4 z-20">
          {[1, 2, 3].map((i) => (
            <Heart
              key={i}
              className="w-4 h-4 md:w-6 md:h-6 text-brand-3 animate-neon-pulse"
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
            className="object-cover"
            ref={imageRef}
          />
        </div>

        {/* Left sidebar text */}
        <div
          ref={textRef}
          className="absolute left-[32px] sm:left-[30px] md:left-[60px] top-1/2 -translate-y-1/2 pr-2 sm:pr-3 md:pr-4"
        >
          <div className="writing-mode-vertical-rl rotate-270 space-y-2 sm:space-y-3 md:space-y-4">
            <h2 className="font-primary font-bold text-3xl sm:text-4xl md:text-5xl lg:text-[64px] leading-none tracking-tighter text-white">
              {data?.heroHeading}
            </h2>
            <p className="font-primary font-medium text-sm sm:text-base md:text-lg lg:text-[20px] leading-none tracking-tight text-white">
              For kicks.
            </p>
          </div>
        </div>

        {/* Arcade Button */}
        <div className="absolute top-1/2 right-8 sm:right-12 md:right-16 -translate-y-1/2 h-16 sm:h-20 md:h-24 w-64 sm:w-80 md:w-96">
          <Link href="/raid" className="group relative bg-transparent z-10">
            <span className="relative z-20 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-primary font-semibold tracking-wider text-white px-8 sm:px-12 md:px-16 py-2 sm:py-3 md:py-4 inline-block transform perspective-[400px] rotate-x-[10deg] neon-text animate-neon-pulse">
              START
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
