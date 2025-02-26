"use client";

import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { Session } from "next-auth";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionContextType {
  isSubscribed: boolean;
  hasActiveTrial: boolean;
  trialStatus: "active" | "ended" | "available";
  isLoading: boolean;
  session: Session | null;
  trialEndDate?: Date | null;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  hasActiveTrial: false,
  trialStatus: "available",
  isLoading: true,
  session: null,
  trialEndDate: null,
});

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading: sessionLoading } = useAuth();

  // Combined query for user and subscription data
  const { data, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription-state"],
    queryFn: async () => {
      const [userRes, subRes] = await Promise.all([
        fetch("/api/user/current"),
        fetch("/api/subscriptions/details"),
      ]);

      if (!userRes.ok || !subRes.ok) throw new Error("Failed to fetch data");

      return {
        user: await userRes.json(),
        subscription: await subRes.json(),
      };
    },
    enabled: !!session?.user,
  });

  // Derive trial status
  const trialStatus = (() => {
    if (data?.user?.hasActiveTrial) {
      return new Date(data.user.trialEndDate) > new Date() ? "active" : "ended";
    }
    return data?.user?.hasTrialEnded ? "ended" : "available";
  })();

// rendering subscription message based on context

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed:
          data?.subscription?.data?.attributes?.status === "active" ||
          (data?.subscription?.data?.attributes?.cancelled &&
            new Date(data?.subscription?.data?.attributes?.ends_at) >
              new Date()),
        hasActiveTrial: trialStatus === "active",
        trialStatus,
        isLoading: sessionLoading || subscriptionLoading,
        session,
        trialEndDate: data?.user?.trialEndDate,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
