'use client';

import { urlForImage } from '@/app/lib/urlForImage';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { SectionData } from '@/app/types';
import { Button } from '@/app/components/ui/Button';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

interface HeroProps {
  data?: {
    heroImageTitle?: string;
    description?: string;
    image?: string;
    aboutHeading?: string;
    aboutDescription?: string;
    viewAppHeading?: string;
    viewAppImage?: string;
    heroAboutImage?: string;
    imagePhotographer?: string;
  }
}

export default function Hero({ data }: HeroProps) {
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [aboutImageLoaded, setAboutImageLoaded] = useState(false);
  const [showPhotographerCredit, setShowPhotographerCredit] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    gsap.to(imageRef.current, {
      opacity: 1,
      scale: 1.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: imageRef.current,
        start: 'top bottom',
        end: 'bottom bottom',
        scrub: 1,
      }
    });
  }, []);

  return (
    <>
      <section className="relative w-full h-[60vh] md:h-[90vh] md:px-[121.51px]">
        {/* Full-width hero image */}
        {data?.image && (
          <Image
            src={data.image}
            alt={data.heroImageTitle || "Hero background"}
            fill
            priority
            quality={100}
            className="object-cover"
            onLoadingComplete={() => setHeroImageLoaded(true)}
          />
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-[var(--color-tertiary)] opacity-45" />

        {/* Hero content */}
        <div className="absolute inset-0 flex items-end">
          <h1 className="heading-1 text-white text-[72px] sm:text-[96px] md:text-[156px] leading-[0.9] font-bold px-4 md:pl-[81px] pb-[32px] md:pb-[54px] uppercase">
            {data?.heroImageTitle}
          </h1>
        </div>
      </section>

      {/* About section with side-by-side layout */}
      <section className="hero-about-section      bg-white px-4 pb-[121px] md:pb-[54px] pt-[54px] md:pt-[121.5px] md:px-[121.51px] ">
        <div className="  gap-[16px]  flex flex-col md:flex-row  md:gap-[54px] w-full">
          {/* Left content */}
          <div className="flex w-full md:w-auto">
            <div className="flex flex-col gap-[16px]">
              <h3 className="text-[32px] font-semibold md:heading-3 md:text-[54px]">{data?.aboutHeading}</h3>
              <div className="hero-about-content-container md:pl-[54px] flex flex-col gap-4 md:gap-6">
                <p className="text-base md:text-lg max-w-[36ch]">{data?.aboutDescription}</p>
                <div className="mt-2">
                  <Link href="/raid">
                    <span className="text-main text-base md:text-lg underline text-[var(--color-text-primary)] hover:text-[var(--color-text-secondary)] transition-colors duration-300">
                      {data?.viewAppHeading}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right image */}
          <div className="w-full md:flex-1 relative h-[240px] md:h-[360px] md:max-w-[540px] overflow-hidden rounded-lg">
            <div className="absolute inset-0 bg-[var(--color-tertiary)]" />
            {data?.heroAboutImage && (
              <div 
                className="relative w-full h-full"
                onMouseEnter={() => setShowPhotographerCredit(true)}
                onMouseLeave={() => setShowPhotographerCredit(false)}
              >
                <Image 
                  ref={imageRef}
                  src={urlForImage(data?.heroAboutImage).url()}
                  alt="Hero about right" 
                  fill 
                  className="object-cover transition-opacity duration-300 opacity-50 hover:opacity-70"
                  onLoad={() => setAboutImageLoaded(true)}
                />
                {data?.imagePhotographer && (
                  <div 
                    className={`
                      absolute bottom-4 right-4 
                      bg-black bg-opacity-50 
                      px-3 py-1 rounded-md 
                      text-white text-sm 
                      transition-all duration-300 ease-in-out
                      ${showPhotographerCredit ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                    `}
                  >
                    Image: {data.imagePhotographer}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}