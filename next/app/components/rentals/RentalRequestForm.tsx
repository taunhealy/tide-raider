"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Beach } from "@prisma/client";
import { DateRangePicker } from "@/app/components/DateRangePicker";

interface RentalRequestFormProps {
  rentalItemId: string;
  availableBeaches: { id: string; name: string }[];
  dailyPrice: number;
}

export function RentalRequestForm({
  rentalItemId,
  availableBeaches,
  dailyPrice,
}: RentalRequestFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedBeachId, setSelectedBeachId] = useState("");

  // Calculate total cost
  const days =
    startDate && endDate
      ? Math.ceil(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;
  const totalCost = days * dailyPrice;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      setError("Please select rental dates");
      return;
    }

    if (!selectedBeachId) {
      setError("Please select a pickup/dropoff location");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rental-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rentalItemId,
          startDate,
          endDate,
          beachId: selectedBeachId,
          totalCost: { zar: totalCost },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create rental request");
      }

      const data = await response.json();
      router.push(`/rentals/requests/${data.id}`);
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-primary">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium">Rental Dates</label>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={({ startDate, endDate }) => {
            setStartDate(startDate);
            setEndDate(endDate);
          }}
          minDate={new Date()}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">
          Pickup/Dropoff Location
        </label>
        <select
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={selectedBeachId}
          onChange={(e) => setSelectedBeachId(e.target.value)}
          required
        >
          <option value="">Select a location</option>
          {availableBeaches.map((beach) => (
            <option key={beach.id} value={beach.id}>
              {beach.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Rental Summary</h3>
        <div className="flex justify-between">
          <span>Daily Rate:</span>
          <span>R{dailyPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Number of Days:</span>
          <span>{days}</span>
        </div>
        <div className="flex justify-between font-bold mt-2 pt-2 border-t border-blue-200">
          <span>Total Cost:</span>
          <span>R{totalCost.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Submitting..." : "Request Rental"}
        </button>
      </div>
    </form>
  );
}
