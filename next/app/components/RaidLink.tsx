"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

interface RaidLinkProps {
  className?: string;
}

const DEFAULT_URL = "/raid?continent=Africa&country=South+Africa";

export default function RaidLink({ className }: RaidLinkProps) {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const { data: defaultFilters } = useQuery({
    queryKey: ["userDefaultFilters"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user/filters");
        if (!response.ok) return null;
        return response.json();
      } catch (error) {
        console.error("Failed to fetch filters:", error);
        return null;
      }
    },
    staleTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating) return;

    setIsNavigating(true);

    try {
      if (defaultFilters?.urlParams) {
        await router.push(
          `/raid?${new URLSearchParams(defaultFilters.urlParams).toString()}`
        );
      } else {
        await router.push(DEFAULT_URL);
      }
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <a href="/raid" onClick={handleClick} className={className}>
      <span className="relative">Raid</span>
    </a>
  );
}
