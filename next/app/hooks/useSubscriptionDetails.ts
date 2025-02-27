import { useQuery } from "@tanstack/react-query";
import { SubscriptionStatus } from "@/app/types/subscription";

export function useSubscriptionDetails() {
  return useQuery({
    queryKey: ["subscriptionDetails"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/details");
      if (!response.ok) {
        if (response.status === 404) return { data: null };
        throw new Error("Failed to fetch subscription details");
      }
      const data = await response.json();

      return {
        data: {
          status: data?.data?.status || SubscriptionStatus.INACTIVE,
          id: data?.data?.subscription?.id,
          next_billing_time: data?.data?.subscription?.next_billing_time,
        },
      };
    },
    refetchOnWindowFocus: false,
    retry: false,
  });
}
