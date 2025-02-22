import { useQuery } from "@tanstack/react-query";

export function useSubscriptionDetails() {
  return useQuery({
    queryKey: ["subscriptionDetails"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/details");
      if (!response.ok) {
        throw new Error("Failed to fetch subscription details");
      }
      return response.json();
    },
    enabled: true, // Only fetch when component mounts
    refetchInterval: 60000, // Refetch every minute to keep URLs fresh
  });
}
