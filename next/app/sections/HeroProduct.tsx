"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { urlForImage } from "@/app/lib/urlForImage";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

interface HeroProductContent {
  title?: string;
  leftDescription?: string;
  rightDescription?: string;
  leftImage?: {
    _type: "image";
    asset: {
      _ref: string;
      _type: "reference";
    };
  };
  filterItems?: Array<{
    _key?: string;
    type: string;
    icon: {
      _type: "image";
      asset: {
        _ref: string;
        _type: "reference";
      };
    };
  }>;
}

export default function HeroProduct({ data }: { data?: HeroProductContent }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPhotographerCredit, setShowPhotographerCredit] = useState(false);
  const imageRef = useRef(null);

  const image = data?.leftImage;

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);

      if (imageRef.current && image) {
        gsap.to(imageRef.current, {
          opacity: 1,
          scale: 1.05,
          ease: "power3.out",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom",
            end: "bottom bottom",
            scrub: 1,
          },
        });
      }
    }

    return () => {
      if (typeof window !== "undefined") {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, [image]);

  if (!data || !image) {
    return null;
  }

  return (
    <section className="hero-product-section bg-[var(--color-bg-secondary)]">
      <div className="hero-product-container flex flex-col md:flex-row w-full">
        {/* Left image */}
        <div className="hero-product-carousel w-full md:w-1/2 relative h-[240px] md:h-screen overflow-hidden">
          <div className="hero-product-overlay absolute inset-0 bg-[var(--color-tertiary)]" />
          <div
            className="hero-product-image-wrapper relative w-full h-full"
            onMouseEnter={() => setShowPhotographerCredit(true)}
            onMouseLeave={() => setShowPhotographerCredit(false)}
          >
            <div className="hero-product-slide absolute inset-0">
              <Image
                ref={imageRef}
                src={urlForImage(image)?.url() || ""}
                alt="Hero product image"
                fill
                priority
                className="hero-product-image object-cover transition-opacity duration-300 opacity-50 hover:opacity-70"
              />
            </div>
          </div>
        </div>

        {/* Right content */}
        <div className="hero-product-content px-4 md:px-[121.51px] flex flex-col justify-center md:w-1/2">
          <div className="hero-product-content-inner flex flex-col gap-[16px] md:gap-[32px]">
            <h3 className="hero-product-title font-primary text-[32px] font-semibold md:heading-3 md:text-[54px]">
              {data?.title}
            </h3>
            <div className="hero-product-description-wrapper flex flex-col gap-4 md:gap-6">
              <p className="hero-product-description font-primary text-base md:text-lg max-w-[36ch]">
                {data?.leftDescription}
              </p>
              {data?.rightDescription && (
                <p className="hero-product-description font-primary text-base md:text-lg max-w-[36ch]">
                  {data.rightDescription}
                </p>
              )}

              {/* Filter items grid */}
              {data?.filterItems && data.filterItems.length > 0 && (
                <div className="filter-items-grid grid grid-cols-2 gap-4">
                  {data.filterItems.map((item, index) => (
                    <div
                      key={item._key || index}
                      className="filter-item group relative flex flex-col items-center gap-2 transform transition-all duration-300 hover:-translate-y-2"
                    >
                      <div className="filter-item-image-wrapper relative w-[108px] h-[108px] rounded-full overflow-hidden border-4 border-white/20 shadow-lg hover:shadow-[var(--color-tertiary)]/50">
                        {item.icon && (
                          <Image
                            src={urlForImage(item.icon)?.url() || ""}
                            alt={`${item.type} icon`}
                            fill
                            className="filter-item-image object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        )}
                      </div>
                      <span className="filter-item-label absolute -bottom-2 z-10 opacity-100 bottom-[-24px] md:opacity-0 md:bottom-[-2px] group-hover:opacity-100 group-hover:bottom-[-24px] transition-all duration-300 text-sm font-medium bg-[var(--color-tertiary)] text-white px-3 py-1 rounded-full shadow-lg">
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
