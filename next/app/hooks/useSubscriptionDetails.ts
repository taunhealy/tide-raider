import { useQuery } from "@tanstack/react-query";

export function useSubscriptionDetails() {
  return useQuery({
    queryKey: ["subscriptionDetails"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/details");
      if (!response.ok) {
        if (response.status === 404) return { data: null };
        throw new Error("Failed to fetch subscription details");
      }
      return response.json();
    },
    refetchOnWindowFocus: false,
    retry: false,
  });
}
