import { useQuery } from "@tanstack/react-query";
import { WindData } from "@/app/types/wind";

export function useSurfConditions(region: string) {
  return useQuery({
    queryKey: ["surfConditions", region],
    queryFn: async () => {
      const date = new Date().toISOString().split("T")[0];
      const url = `/api/surf-conditions?region=${encodeURIComponent(region)}&date=${date}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data?.wind || !data?.swell) {
        return null;
      }

      const windData: WindData = {
        region: data.region,
        wind: data.wind,
        swell: data.swell,
      };

      return windData;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
