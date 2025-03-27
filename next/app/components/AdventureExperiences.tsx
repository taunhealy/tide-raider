"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/app/lib/utils";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/app/components/ui/tabs";

type Adventure = {
  id: string;
  title: string;
  location: string;
  description: string;
  imageUrl: string;
  rating: number;
  price: string;
  url: string;
};

type AdventureCategory = {
  id: string;
  label: string;
  emoji: string;
  adventures: Adventure[];
};

const ADVENTURE_CATEGORIES: AdventureCategory[] = [
  {
    id: "kayaking",
    label: "Kayaking",
    emoji: "🚣",
    adventures: [
      {
        id: "kay-1",
        title: "Ocean Kayaking Tour",
        location: "Cape Town",
        description: "Explore the coastline with expert guides",
        imageUrl: "/images/adventures/kayaking-1.jpg",
        rating: 4.8,
        price: "R650",
        url: "/adventures/kayaking/ocean-tour",
      },
      {
        id: "kay-2",
        title: "Sunset Paddle Experience",
        location: "Langebaan",
        description: "Peaceful evening kayaking with stunning views",
        imageUrl: "/images/adventures/kayaking-2.jpg",
        rating: 4.7,
        price: "R550",
        url: "/adventures/kayaking/sunset-paddle",
      },
    ],
  },
  {
    id: "diving",
    label: "Diving",
    emoji: "🤿",
    adventures: [
      {
        id: "div-1",
        title: "Reef Diving Adventure",
        location: "Sodwana Bay",
        description: "Discover vibrant coral reefs and marine life",
        imageUrl: "/images/adventures/diving-1.jpg",
        rating: 4.9,
        price: "R1200",
        url: "/adventures/diving/reef-adventure",
      },
      {
        id: "div-2",
        title: "Shipwreck Exploration",
        location: "False Bay",
        description: "Dive among historic shipwrecks with certified guides",
        imageUrl: "/images/adventures/diving-2.jpg",
        rating: 4.6,
        price: "R1500",
        url: "/adventures/diving/shipwreck",
      },
    ],
  },
  {
    id: "paragliding",
    label: "Paragliding",
    emoji: "🪂",
    adventures: [
      {
        id: "para-1",
        title: "Coastal Paragliding",
        location: "Lion's Head",
        description: "Soar above the coastline with breathtaking views",
        imageUrl: "/images/adventures/paragliding-1.jpg",
        rating: 4.9,
        price: "R1800",
        url: "/adventures/paragliding/coastal",
      },
      {
        id: "para-2",
        title: "Tandem Mountain Flight",
        location: "Hermanus",
        description: "Experience the thrill with a professional pilot",
        imageUrl: "/images/adventures/paragliding-2.jpg",
        rating: 4.7,
        price: "R1600",
        url: "/adventures/paragliding/tandem",
      },
    ],
  },
  {
    id: "shark-cage",
    label: "Shark Cage",
    emoji: "🦈",
    adventures: [
      {
        id: "shark-1",
        title: "Great White Encounter",
        location: "Gansbaai",
        description: "Face-to-face with great white sharks in a secure cage",
        imageUrl: "/images/adventures/shark-1.jpg",
        rating: 4.8,
        price: "R2200",
        url: "/adventures/shark-cage/great-white",
      },
      {
        id: "shark-2",
        title: "Shark Research Expedition",
        location: "Mossel Bay",
        description: "Join marine biologists studying shark behavior",
        imageUrl: "/images/adventures/shark-2.jpg",
        rating: 4.6,
        price: "R2500",
        url: "/adventures/shark-cage/research",
      },
    ],
  },
];

export default function AdventureExperiences() {
  const [activeTab, setActiveTab] = useState(ADVENTURE_CATEGORIES[0].id);
  const [isMounted, setIsMounted] = useState(false);
  const errorImagePath = "/images/placeholder.jpg"; // Updated placeholder path

  // Use a ref to track if the effect has run
  const effectRan = useRef(false);

  // Prevent hydration errors by only rendering after component mounts
  useEffect(() => {
    // Only run the effect once in development mode
    if (effectRan.current === false) {
      setIsMounted(true);
      effectRan.current = true;
    }

    return () => {
      // For strict mode in development
      if (process.env.NODE_ENV === "development") {
        effectRan.current = false;
      }
    };
  }, []);

  // Return null or a loading state during server-side rendering
  if (!isMounted) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 min-h-[400px]"></div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[18px] font-semibold text-gray-800 font-primary">
          Adventure Experiences
        </h3>
      </div>

      <Tabs
        defaultValue={ADVENTURE_CATEGORIES[0].id}
        onValueChange={setActiveTab}
      >
        <TabsList className="flex flex-wrap gap-2 mb-4">
          {ADVENTURE_CATEGORIES.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="font-primary text-sm"
              title={category.label}
            >
              {category.emoji}
            </TabsTrigger>
          ))}
        </TabsList>

        {ADVENTURE_CATEGORIES.map((category) => (
          <TabsContent
            key={category.id}
            value={category.id}
            className="space-y-4"
          >
            {category.adventures.map((adventure) => (
              <Link href={adventure.url} key={adventure.id} className="block">
                <div className="group flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <div className="relative h-40 w-full">
                    <div className="absolute inset-0 bg-gray-200 animate-pulse"></div>
                    <Image
                      src={adventure.imageUrl}
                      alt={adventure.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = errorImagePath;
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-primary font-medium text-gray-900 group-hover:text-black/80 transition-colors">
                        {adventure.title}
                      </h4>
                      <span className="font-primary text-sm font-semibold text-black/80">
                        {adventure.price}
                      </span>
                    </div>
                    <div className="flex items-center mb-2">
                      <span className="text-sm text-gray-600 font-primary">
                        {adventure.location}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 font-primary line-clamp-2">
                      {adventure.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            <div className="text-center pt-2">
              <Link
                href={`/adventures/${category.id}`}
                className="text-sm text-black hover:underline font-primary"
              >
                View all {category.label.toLowerCase()} experiences →
              </Link>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
