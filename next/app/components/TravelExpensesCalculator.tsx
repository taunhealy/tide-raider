"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FlightCost } from "@/app/lib/tripExpenses";

interface Props {
  destinationAirport: {
    code: string;
    name: string;
  };
  accommodation: {
    costPerNight: number;
    hotelName: string;
    bookingLink: string;
  };
  dailyExpenses: {
    food: number;
    transport: number;
    activities: number;
    medical: number;
  };
}

export default function TravelExpensesCalculator({
  destinationAirport,
  accommodation,
  dailyExpenses,
}: Props) {
  const [originAirport, setOriginAirport] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [numberOfNights, setNumberOfNights] = useState(1);

  const { data: flights, isLoading } = useQuery({
    queryKey: [
      "flights",
      originAirport,
      destinationAirport.code,
      departureDate,
    ],
    queryFn: async () => {
      if (!originAirport || !departureDate) return null;

      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originCode: originAirport,
          destinationCode: destinationAirport.code,
          date: departureDate,
        }),
      });

      return response.json();
    },
    enabled: Boolean(originAirport && departureDate),
  });

  const calculateDailyTotal = () => {
    return Object.values(dailyExpenses).reduce((sum, cost) => sum + cost, 0);
  };

  const totalDailyCost = calculateDailyTotal() * numberOfNights;
  const totalCost =
    (flights?.reduce((total: number, flight: FlightCost) => {
      return total + flight.price;
    }, 0) || 0) +
    accommodation.costPerNight * numberOfNights +
    totalDailyCost;

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Trip Cost Calculator</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Your Airport (IATA code)
          </label>
          <input
            type="text"
            value={originAirport}
            onChange={(e) => setOriginAirport(e.target.value.toUpperCase())}
            className="w-full p-2 border rounded"
            placeholder="LAX"
            maxLength={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Departure Date
          </label>
          <input
            type="date"
            value={departureDate}
            onChange={(e) => setDepartureDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Nights
          </label>
          <input
            type="number"
            value={numberOfNights}
            onChange={(e) => setNumberOfNights(parseInt(e.target.value))}
            className="w-full p-2 border rounded"
            min="1"
          />
        </div>

        {isLoading && <div>Searching flights...</div>}

        {flights && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Available Flights</h4>
            {flights.map((flight: FlightCost, index: number) => (
              <div key={index} className="p-2 border rounded mb-2">
                <div className="flex justify-between">
                  <span>{flight.airline}</span>
                  <span>${flight.price}</span>
                </div>
                <div className="text-sm text-gray-500">{flight.duration}</div>
              </div>
            ))}
          </div>
        )}

        {totalCost && (
          <div className="mt-4 space-y-4">
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Daily Expenses Breakdown</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Food:</span>
                  <span>${dailyExpenses.food}/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Transport:</span>
                  <span>${dailyExpenses.transport}/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Activities:</span>
                  <span>${dailyExpenses.activities}/day</span>
                </div>
                <div className="flex justify-between">
                  <span>Medical:</span>
                  <span>${dailyExpenses.medical}/day</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Daily Total:</span>
                  <span>${calculateDailyTotal()}/day</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-2">Total Trip Cost</h4>
              <div className="text-2xl font-bold">${totalCost}</div>
              <div className="text-sm text-gray-500 mt-1">
                Includes flights, {numberOfNights} nights at{" "}
                {accommodation.hotelName}, and daily expenses
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
