import { useQuery } from "@tanstack/react-query";
import { WindData, isValidWindData } from "@/app/types/wind";

export function useSurfConditions(region: string) {
  return useQuery({
    queryKey: ["surfConditions", region],
    queryFn: async () => {
      try {
        const date = new Date().toISOString().split("T")[0];
        const url = `/api/surf-conditions?region=${encodeURIComponent(region)}&date=${date}`;
        console.log(`Fetching surf conditions from: ${url}`);

        const response = await fetch(url);
        console.log(`Response status: ${response.status}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(
          `Raw API response for ${region}:`,
          JSON.stringify(data, null, 2)
        );

        // Add specific Western Cape debug
        if (region === "Western Cape") {
          console.log("Western Cape specific debug:", {
            hasData: !!data,
            windData: data?.wind,
            swellData: data?.swell,
          });
        }

        if (!data?.wind || !data?.swell) {
          console.error("Invalid data structure received:", data);
          return null;
        }

        const windData: WindData = {
          wind: {
            speed: Number(data.wind.speed),
            direction: data.wind.direction,
          },
          swell: {
            height: Number(data.swell.height),
            period: Number(data.swell.period),
            direction: Number(data.swell.direction),
          },
          timestamp: Date.now(),
        };

        if (!isValidWindData(windData)) {
          console.error("Invalid wind data format:", windData);
          return null;
        }

        console.log(
          `Formatted data for ${region}:`,
          JSON.stringify(windData, null, 2)
        );
        return windData;
      } catch (error) {
        console.error(`Error fetching conditions for ${region}:`, error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
}
