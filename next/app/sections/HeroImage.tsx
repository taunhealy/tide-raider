import { urlForImage } from "@/app/lib/urlForImage";
import { SanityImage } from "@/types";
import Image from "next/image";
interface HeroImageProps {
  image: SanityImage;
  text?: string;
}

export default function HeroImage({ image, text }: HeroImageProps) {
  return (
    <div className="relative w-full h-screen p-6 md:p-12">
      {/* Image container with padding */}
      <div className="relative w-full h-full">
        The issue is that urlForImage(image.asset._ref) is passing a string, but
        urlForImage() expects an ImageSource (which is typically a full asset
        object, not just a _ref). ✅ Best Fix: Pass the Whole Image Object
        Instead of passing image.asset._ref, pass the full image object to
        urlForImage(). Modify HeroImage.tsx tsx Copy Edit
        <Image
          src={urlForImage(image)?.url() || ""}
          alt={image.alt || "Hero image"}
          fill
          className="object-cover"
          priority
        />
        {/* Text overlay */}
        {text && (
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="font-secondary text-white text-[81px] md:text-[156px] leading-tight uppercase">
              {text}
            </h1>
          </div>
        )}
      </div>
    </div>
  );
}
