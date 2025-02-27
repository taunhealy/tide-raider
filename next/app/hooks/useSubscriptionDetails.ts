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
      const data = await response.json();

      // Transform PayPal subscription data to match your app's format
      return {
        data: data.subscription
          ? {
              id: data.subscription.id,
              status: data.subscription.status,
              plan_id: data.subscription.plan_id,
              create_time: data.subscription.create_time,
              next_billing_time:
                data.subscription.billing_info?.next_billing_time,
            }
          : null,
      };
    },
    refetchOnWindowFocus: false,
    retry: false,
  });
}
