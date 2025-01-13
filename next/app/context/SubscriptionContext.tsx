'use client'

import { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SubscriptionContextType {
  isSubscribed: boolean;
  isLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isSubscribed: false,
  isLoading: false,
});

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const response = await fetch('/api/subscription-status');
      if (!response.ok) throw new Error('Failed to fetch subscription status');
      return response.json();
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false
  });

  return (
    <SubscriptionContext.Provider value={{ 
      isSubscribed: data?.isSubscribed ?? false,
      isLoading 
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => useContext(SubscriptionContext); 