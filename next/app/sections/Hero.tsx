"use client";

import { urlForImage } from "@/app/lib/urlForImage";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ThreeJSEdgyX from "../components/ThreeJSEdgyX";
import VHSEffect from "../components/VHSEffect";

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
    <section className="relative w-full h-[60vh] md:h-[90vh] overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src={imageUrl || ""}
          alt={data?.heroImage?.alt || ""}
          fill
          className="object-cover"
        />
      </div>

      {/* VHS Effect Overlay */}
      <VHSEffect />

      {/* Left sidebar text */}
      <div
        ref={textRef}
        className="absolute left-[40px] top-1/2 -translate-y-1/2 pr-4 border-r border-white"
      >
        <div className="writing-mode-vertical-rl rotate-270 space-y-4">
          <h2 className="font-primary font-bold text-[64px] leading-none tracking-tighter text-white">
            {data?.heroHeading}
          </h2>
          <p className="font-primary font-medium text-[20px] leading-none tracking-tight text-white">
            For kicks.
          </p>
        </div>
      </div>
    </section>
  );
}
