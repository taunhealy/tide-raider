"use client";

import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";

const SubscriptionContext = createContext<{
  isSubscribed: boolean;
  isLoading: boolean;
}>({
  isSubscribed: false,
  isLoading: true,
});

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, isLoading } = useAuth();

  return (
    <SubscriptionContext.Provider
      value={{
        isSubscribed: session?.user?.isSubscribed ?? false,
        isLoading,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext);
