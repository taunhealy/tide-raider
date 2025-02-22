"use client";

import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { Session } from "next-auth";
import { useQuery } from "@tanstack/react-query";

interface SubscriptionContextType {
  isSubscribed: boolean;
  hasActiveTrial: boolean;
  isLoading: boolean;
  session: Session | null;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  hasActiveTrial: false,
  isLoading: true,
  session: null,
});

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading: sessionLoading } = useAuth();

  const { data: subscriptionData, isLoading: subscriptionLoading } = useQuery({
    queryKey: ["subscription-details"],
    queryFn: async () => {
      const response = await fetch("/api/subscriptions/details");
      if (!response.ok) throw new Error("Failed to fetch subscription details");
      return response.json();
    },
    enabled: !!session?.user,
  });

  const hasActiveTrial =
    subscriptionData?.data?.attributes?.status === "trialing" &&
    new Date(subscriptionData?.data?.attributes?.trial_ends_at) > new Date();

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed: session?.user?.isSubscribed ?? false,
        hasActiveTrial,
        isLoading: sessionLoading || subscriptionLoading,
        session,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
