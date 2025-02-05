"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface UnsplashImage {
  id: string;
  urls: {
    small: string;
  };
  alt_description: string;
}

interface UnsplashGridWidgetProps {
  title: string;
  searchTerm: string;
}

export default function UnsplashGridWidget({
  title,
  searchTerm,
}: UnsplashGridWidgetProps) {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="grid grid-cols-2 gap-2 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {images.map((image) => (
          <div
            key={image.id}
            className="aspect-square relative overflow-hidden rounded"
          >
            <Image
              src={image.urls.small}
              alt={image.alt_description || "Unsplash image"}
              fill
              className="object-cover hover:scale-110 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
