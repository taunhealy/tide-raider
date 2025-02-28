"use client";
import { useState } from "react";
import { CloudflareImage } from "@/components/CloudflareImage";

interface BoardImageGalleryProps {
  images: string[];
  thumbnail: string;
  boardName: string;
}

export function BoardImageGallery({
  images,
  thumbnail,
  boardName,
}: BoardImageGalleryProps) {
  const [mainImage, setMainImage] = useState(thumbnail);

  return (
    <div className="space-y-4">
      <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
        <CloudflareImage
          id={mainImage}
          alt={boardName}
          className="object-cover"
        />
      </div>
      <div className="grid grid-cols-4 gap-4">
        {images.map((imageId: string) => (
          <button
            key={imageId}
            className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden"
            onClick={() => setMainImage(imageId)}
          >
            <CloudflareImage id={imageId} alt="" className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
