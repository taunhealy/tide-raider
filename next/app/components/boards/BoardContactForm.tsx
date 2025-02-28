"use client";

import { useState } from "react";
import { calculateRentalCost } from "@/app/lib/rentalUtility";
import { differenceInWeeks } from "date-fns";

interface BoardContactFormProps {
  boardId: string;
  availableBeaches: Array<{ id: string; name: string }>;
  onSubmit?: (formData: RentalRequest) => void;
}

interface RentalRequest {
  startDate: string;
  endDate: string;
  beachId: string;
  totalCost: {
    zar: number;
    usd: number;
  };
}

export function BoardContactForm({
  boardId,
  availableBeaches,
  onSubmit,
}: BoardContactFormProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedBeach, setSelectedBeach] = useState("");
  const [cost, setCost] = useState({ zarAmount: 0, usdAmount: 0 });

  const handleDatesChange = (start: string, end: string) => {
    if (start && end) {
      const weeks = differenceInWeeks(new Date(end), new Date(start));
      const rentalCost = calculateRentalCost(weeks);
      setCost(rentalCost);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({
        startDate,
        endDate,
        beachId: selectedBeach,
        totalCost: {
          zar: cost.zarAmount,
          usd: cost.usdAmount,
        },
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 font-primary">
      <div className="space-y-2">
        <label
          htmlFor="startDate"
          className="block text-[var(--color-text-primary)]"
        >
          Pick-up Date
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
            handleDatesChange(e.target.value, endDate);
          }}
          min={new Date().toISOString().split("T")[0]}
          className="input-base w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="endDate"
          className="block text-[var(--color-text-primary)]"
        >
          Drop-off Date
        </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
            handleDatesChange(startDate, e.target.value);
          }}
          min={startDate || new Date().toISOString().split("T")[0]}
          className="input-base w-full"
          required
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="beach"
          className="block text-[var(--color-text-primary)]"
        >
          Pick-up Location
        </label>
        <select
          id="beach"
          value={selectedBeach}
          onChange={(e) => setSelectedBeach(e.target.value)}
          className="input-base w-full"
          required
        >
          <option value="">Select a beach</option>
          {availableBeaches.map((beach) => (
            <option key={beach.id} value={beach.id}>
              {beach.name}
            </option>
          ))}
        </select>
      </div>

      {cost.zarAmount > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-[var(--color-text-primary)] mb-2">
            Rental Cost
          </h3>
          <p className="text-[var(--color-text-secondary)]">
            R{cost.zarAmount} (${cost.usdAmount.toFixed(2)} USD)
          </p>
        </div>
      )}

      <button type="submit" className="btn-tertiary w-full px-4 py-2">
        Submit Rental Request
      </button>
    </form>
  );
}
