import { useQuery } from "@tanstack/react-query";
import { SurfForecast } from "@/app/types/wind";

export function useSurfConditions(region: string = "Western Cape") {
  return useQuery({
    queryKey: ["surfConditions", region],
    queryFn: async () => {
      console.log("🌊 Fetching conditions for region:", region);

      const res = await fetch(
        `/api/surf-conditions?region=${encodeURIComponent(region)}`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        console.error("❌ Surf conditions fetch failed:", res.status);
        return null;
      }

      const data = await res.json();
      return data?.entries?.[0] || null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
  });
}
