"use client";

import { useQuery } from "@tanstack/react-query";
import TravelExpensesCalculator from "../TravelExpensesCalculator";

interface TripExpensesSidebarProps {
  travelCosts?: {
    airports: Array<{
      iata: string;
      name: string;
      city: string;
      country: string;
    }>;
    accommodation?: {
      costPerNight: number;
      hotelName: string;
      bookingLink: string;
    };
    dailyExpenses?: {
      food: number;
      transport: number;
      activities: number;
      medical: number;
    };
  };
  location?: {
    beachName: string;
    region: string;
    country: string;
  };
}

export default function TripExpensesSidebar({
  travelCosts,
  location,
}: TripExpensesSidebarProps) {
  const { data: initialData, isLoading } = useQuery({
    queryKey: ["travel", "initial", location?.beachName],
    queryFn: async () => {
      if (!location) return null;
      const response = await fetch("/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "initial",
          params: { cityCode: location.region },
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch travel data");
      return response.json();
    },
    enabled: !!location,
    initialData: travelCosts,
  });

  if (isLoading || !initialData || !location) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Travel Expenses</h3>
        <p className="text-gray-600">
          Loading flight prices, accommodation costs, and daily expenses
          {location?.beachName ? ` for ${location.beachName}` : ""}...
        </p>
      </div>
    );
  }

  return (
    <TravelExpensesCalculator
      destinations={{
        airports: initialData.airports,
        cityCode: location.region,
      }}
      recommendedStays={[
        initialData.accommodation
          ? {
              hotelId: "default",
              name: initialData.accommodation.hotelName,
              stars: 4,
              averagePrice: initialData.accommodation.costPerNight,
            }
          : {
              hotelId: "default",
              name: "No hotels available",
              stars: 0,
              averagePrice: 0,
            },
      ]}
      dailyExpenses={
        initialData.dailyExpenses || {
          food: 0,
          transport: 0,
          activities: 0,
          medical: 0,
        }
      }
      location={location}
    />
  );
}
