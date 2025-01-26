"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Loader2 } from "lucide-react";

interface Props {
  destinations: {
    airports: Array<{
      iata: string;
      name: string;
      city: string;
      country: string;
    }>;
    cityCode: string;
  };
  recommendedStays: Array<{
    hotelId: string;
    name: string;
    stars: number;
    averagePrice: number;
  }>;
  dailyExpenses: {
    food: number;
    transport: number;
    activities: number;
    medical: number;
  };
  location: {
    beachName: string;
    region: string;
    country: string;
  };
}

interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export default function TravelExpensesCalculator({
  destinations,
  recommendedStays,
  dailyExpenses,
  location,
}: Props) {
  const [originAirport, setOriginAirport] = useState("");
  const [selectedDestination, setSelectedDestination] = useState(
    destinations.airports[0]?.iata || ""
  );
  const [dates, setDates] = useState({
    departure: "",
    return: "",
  });
  const [travelers, setTravelers] = useState({
    adults: 2,
    children: 0,
  });
  const [selectedHotel, setSelectedHotel] = useState<string | null>(null);

  // Flight search query
  const { data: flightData, isLoading: isLoadingFlights } = useQuery({
    queryKey: ["travel", "flights", originAirport, selectedDestination, dates],
    queryFn: async () => {
      if (!originAirport || !selectedDestination || !dates.departure)
        return null;

      const response = await fetch("/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "flights",
          params: {
            origin: originAirport,
            destination: selectedDestination,
            departureDate: dates.departure,
            returnDate: dates.return,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch flight data");
      return response.json();
    },
    enabled: Boolean(originAirport && selectedDestination && dates.departure),
  });

  // Hotel search query
  const { data: hotelData, isLoading: isLoadingHotels } = useQuery({
    queryKey: ["travel", "hotels", dates, travelers],
    queryFn: async () => {
      if (!dates.departure || !dates.return) return null;

      const response = await fetch("/api/travel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "hotels",
          params: {
            cityCode: destinations.cityCode,
            checkIn: dates.departure,
            checkOut: dates.return,
            adults: travelers.adults,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch hotel data");
      return response.json();
    },
    enabled: Boolean(dates.departure && dates.return),
  });

  // Calculate total trip cost
  const calculateTotalCost = () => {
    const flightCost = flightData?.flights?.[0]?.price || 0;
    const hotelCost = selectedHotel
      ? hotelData?.hotels?.[selectedHotel]?.price || 0
      : 0;
    const numberOfDays =
      dates.return && dates.departure
        ? Math.ceil(
            (new Date(dates.return).getTime() -
              new Date(dates.departure).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

    const dailyTotal = Object.values(dailyExpenses).reduce((a, b) => a + b, 0);
    const expensesTotal = dailyTotal * numberOfDays;

    return {
      flight: flightCost,
      hotel: hotelCost,
      daily: expensesTotal,
      total: flightCost + hotelCost + expensesTotal,
    };
  };

  // Add before rendering SidebarSelector
  const { data: sidebarData } = useQuery({
    queryKey: ["travelExpenses", location.beachName],
    queryFn: async () => {
      // Temporary mock data until API is ready
      return {
        airports: [
          {
            iata: "CPT",
            name: "Cape Town International",
            city: "Cape Town",
            country: "South Africa",
          },
        ],
        accommodation: [
          {
            hotelId: "h1",
            name: "Beach Hotel",
            stars: 4,
            averagePrice: 150,
          },
        ],
        dailyExpenses: {
          food: 30,
          transport: 20,
          activities: 40,
          medical: 10,
        },
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    initialData: {
      airports: destinations.airports,
      accommodation: recommendedStays,
      dailyExpenses: dailyExpenses,
    },
  });

  return (
    <div className="bg-[var(--color-bg-primary)] p-6 rounded-lg shadow-sm space-y-6">
      {/* Header Section */}
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-xl font-semibold text-gray-800">
          Trip Cost Calculator
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Plan your trip to {location.beachName}, {location.country}
        </p>
      </div>

      <div className="space-y-6">
        {/* Flight Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Flight Details
          </h4>

          <div className="relative">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Your Departure Airport
            </label>
            <div className="relative">
              <input
                type="text"
                value={originAirport}
                onChange={(e) => setOriginAirport(e.target.value)}
                placeholder="Enter city or airport code (e.g., JFK, London)"
                className="w-full p-2.5 pl-9 border border-gray-200 rounded-md focus:ring-2 focus:ring-[var(--color-bg-tertiary)] focus:border-transparent"
              />
              {isLoadingFlights ? (
                <Loader2 className="w-4 h-4 absolute left-2.5 top-3.5 animate-spin text-gray-400" />
              ) : (
                <Search className="w-4 h-4 absolute left-2.5 top-3.5 text-gray-400" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Nearest Airport to {location.beachName}
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[var(--color-bg-tertiary)] focus:border-transparent"
            >
              {destinations.airports.map((airport) => (
                <option key={airport.iata} value={airport.iata}>
                  {airport.name} ({airport.iata})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dates and Travelers Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Trip Details
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Departure Date
              </label>
              <input
                type="date"
                value={dates.departure}
                onChange={(e) =>
                  setDates((prev) => ({ ...prev, departure: e.target.value }))
                }
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[var(--color-bg-tertiary)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Return Date
              </label>
              <input
                type="date"
                value={dates.return}
                onChange={(e) =>
                  setDates((prev) => ({ ...prev, return: e.target.value }))
                }
                min={dates.departure || new Date().toISOString().split("T")[0]}
                className="w-full p-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[var(--color-bg-tertiary)] focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Adults
              </label>
              <input
                type="number"
                value={travelers.adults}
                onChange={(e) =>
                  setTravelers((prev) => ({
                    ...prev,
                    adults: Math.max(1, parseInt(e.target.value) || 1),
                  }))
                }
                min="1"
                className="w-full p-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[var(--color-bg-tertiary)] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Children
              </label>
              <input
                type="number"
                value={travelers.children}
                onChange={(e) =>
                  setTravelers((prev) => ({
                    ...prev,
                    children: Math.max(0, parseInt(e.target.value) || 0),
                  }))
                }
                min="0"
                className="w-full p-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[var(--color-bg-tertiary)] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Accommodation Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Accommodation
          </h4>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Select Accommodation
            </label>
            <select
              value={selectedHotel || ""}
              onChange={(e) => setSelectedHotel(e.target.value)}
              className="w-full p-2.5 border border-gray-200 rounded-md focus:ring-2 focus:ring-[var(--color-bg-tertiary)] focus:border-transparent"
            >
              <option value="">Choose a hotel...</option>
              {recommendedStays.map((hotel) => (
                <option key={hotel.hotelId} value={hotel.hotelId}>
                  {hotel.name} ({hotel.stars}★) - ${hotel.averagePrice}/night
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Daily Expenses Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
            Daily Expenses
          </h4>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Food & Drinks</span>
              <span className="font-medium">${dailyExpenses.food}/day</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Local Transport</span>
              <span className="font-medium">
                ${dailyExpenses.transport}/day
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Activities</span>
              <span className="font-medium">
                ${dailyExpenses.activities}/day
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Medical & Insurance</span>
              <span className="font-medium">${dailyExpenses.medical}/day</span>
            </div>
            <div className="pt-2 border-t border-gray-200 flex justify-between font-medium">
              <span>Daily Total</span>
              <span>
                ${Object.values(dailyExpenses).reduce((a, b) => a + b, 0)}/day
              </span>
            </div>
          </div>
        </div>

        {/* Total Cost Summary */}
        <div className="bg-[var(--color-bg-secondary)] p-4 rounded-lg space-y-3">
          <h4 className="font-medium text-gray-800">Total Trip Cost</h4>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Flights</span>
              <span className="font-medium">
                ${flightData?.flights?.[0]?.price.toFixed(2) || "---"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Accommodation</span>
              <span className="font-medium">
                $
                {selectedHotel
                  ? hotelData?.hotels?.[selectedHotel]?.price.toFixed(2)
                  : "---"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Daily Expenses (total)</span>
              <span className="font-medium">
                ${calculateTotalCost().daily.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-lg pt-2 border-t border-gray-300">
              <span className="font-semibold">Total Estimated Cost</span>
              <span className="font-semibold text-[var(--color-text-tertiary)]">
                ${calculateTotalCost().total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {flightData?.searchUrl && (
            <a
              href={flightData.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-[var(--color-bg-tertiary)] text-white py-2.5 rounded-md hover:opacity-90 transition-opacity font-medium"
            >
              Search Flights
            </a>
          )}
          {hotelData?.searchUrl && (
            <a
              href={hotelData.searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center border border-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)] py-2.5 rounded-md hover:bg-gray-50 transition-colors font-medium"
            >
              Search Hotels
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
