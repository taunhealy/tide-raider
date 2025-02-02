import { urlForImage } from "@/app/lib/urlForImage";
import { SanityImage } from "@/types";
import Image from "next/image";
import { Post, Category } from "@/types"; // Ensure you have the correct import path

interface HeroImageProps {
  data: {
    heroHeading?: string;
    heroSubheading?: string;
    heroImage: SanityImage;
    overlayText?: string;
  };
}

export default function HeroImage({ data }: HeroImageProps) {
  const imageUrl = data.heroImage?.asset
    ? urlForImage(data.heroImage)?.url()
    : null;

  return (
    <div className="relative w-full h-screen p-6 md:p-12">
      <div className="relative w-full h-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={data.heroImage?.alt || "Hero image"}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800">
            <p className="text-white">Image not available</p>
          </div>
        )}

        {data.overlayText && (
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="font-secondary text-white text-[81px] md:text-[156px] leading-tight uppercase">
              {data.overlayText}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
