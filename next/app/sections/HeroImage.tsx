"use client";

import React, { useState } from "react";
import Image from "next/image";
import { urlForImage } from "@/app/lib/urlForImage";

interface HeroImageProps {
  data?: {
    image?: any;
    title?: string;
    imagePhotographer?: string;
  };
}

const HeroImage: React.FC<HeroImageProps> = ({ data }) => {
  const [showPhotographerCredit, setShowPhotographerCredit] = useState(false);

  return (
    <section className="py-[32px] md:py-[54px] px-4 md:px-[81px]">
      <div className="md:pl-[54px]">
        <div className="relative w-full max-w-full min-h-[300px] md:min-h-[508px]">
          <div
            className="relative w-full h-[300px] md:h-[508px]"
            onMouseEnter={() => setShowPhotographerCredit(true)}
            onMouseLeave={() => setShowPhotographerCredit(false)}
          >
            {data?.image && (
              <Image
                src={
                  data?.image?.asset
                    ? urlForImage(data.image)?.url() || "/placeholder.jpg"
                    : "/placeholder.jpg"
                }
                alt="Hero background"
                fill
                priority
                quality={100}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                className="object-cover sm:object-[center_15%_top] object-[center_left_top] rounded-lg"
              />
            )}
            {data?.imagePhotographer && (
              <div
                className={`
                  absolute bottom-4 right-4 
                  bg-black bg-opacity-50 
                  px-3 py-1 rounded-md 
                  text-white text-sm 
                  transition-all duration-300 ease-in-out
                  ${showPhotographerCredit ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                `}
              >
                Photo by {data.imagePhotographer}
              </div>
            )}
          </div>
          <h1 className="heading-1 absolute top-[32px] pb-[32px] md:pb-[54px] left-0 md:left-[54px] text-[72px] sm:text-[96px] md:text-[156px] text-white leading-[0.9] sm:leading-[0.95] whitespace-normal">
            {data?.title || "REAP THE GOLD"}
          </h1>
        </div>
      </div>
    </section>
  );
};

export default HeroImage;
