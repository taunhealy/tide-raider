import { useQuery } from "@tanstack/react-query";

export function useSurfConditions(region: string = "Western Cape") {
  return useQuery({
    queryKey: ["surfConditions", region],
    queryFn: async () => {
      const res = await fetch(
        `/api/surf-conditions?region=${encodeURIComponent(region)}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch surf conditions");
      }
      const data = await res.json();

      // Validate the data structure
      if (!data?.wind?.direction || !data?.swell?.direction) {
        console.error("Invalid wind data structure:", data);
        return null;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}
