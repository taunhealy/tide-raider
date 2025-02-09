"use client";

import { urlForImage } from "@/app/lib/urlForImage";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

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

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
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
      className="relative w-full h-[60vh] md:h-[90vh] md:px-[121.51px]"
    >
      {imageUrl && (
        <Image
          ref={imageRef}
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
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-[var(--color-tertiary)] opacity-30"
      />

      {/* Sidebar with vertical text */}
      <div className="absolute left-[40px] top-1/2 -translate-y-1 border-r border-white pr-4">
        <div className="writing-mode-vertical-rl rotate-270 space-y-4">
          <h2 className="font-primary font-bold text-[64px] leading-none tracking-tighter text-white">
            {data?.heroHeading}
          </h2>
          <p className="font-primary font-medium text-[20px] leading-none tracking-tight text-white">
            New frontiers.
          </p>
        </div>
      </div>
    </section>
  );
}
