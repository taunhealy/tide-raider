"use client";

import { useState } from "react";
import { DayPicker, DayClickEventHandler } from "react-day-picker";
import "react-day-picker/dist/style.css";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (dates: { startDate: Date | null; endDate: Date | null }) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate = new Date(),
  maxDate,
  disabledDates = [],
}: DateRangePickerProps) {
  const [selectedRange, setSelectedRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: startDate || undefined,
    to: endDate || undefined,
  });

  const handleDayClick: DayClickEventHandler = (day, modifiers) => {
    if (modifiers.disabled) return;

    const range = { ...selectedRange };

    // If no dates selected or both dates selected, start a new range
    if (!range.from || (range.from && range.to)) {
      range.from = day;
      range.to = undefined;
    }
    // If start date selected but no end date, set the end date
    else if (range.from && !range.to) {
      // Ensure end date is after start date
      if (day < range.from) {
        range.to = range.from;
        range.from = day;
      } else {
        range.to = day;
      }
    }

    setSelectedRange(range);
    onChange({
      startDate: range.from || null,
      endDate: range.to || null,
    });
  };

  // Disable dates before minDate, after maxDate, and any specific disabled dates
  const disabledDays = [
    { before: minDate },
    ...(maxDate ? [{ after: maxDate }] : []),
    ...disabledDates,
  ];

  return (
    <div className="bg-white rounded-md shadow-sm border p-4">
      <DayPicker
        mode="range"
        selected={selectedRange}
        onDayClick={handleDayClick}
        disabled={disabledDays}
        numberOfMonths={2}
        pagedNavigation
        showOutsideDays
        fixedWeeks
        styles={{
          caption: { color: "#3b82f6" },
          day_selected: { backgroundColor: "#3b82f6" },
          day_range_middle: { backgroundColor: "#dbeafe" },
          day_range_end: { backgroundColor: "#3b82f6" },
          day_range_start: { backgroundColor: "#3b82f6" },
        }}
        modifiersClassNames={{
          selected: "bg-blue-500 text-white rounded-full",
          range_middle: "bg-blue-100",
          range_start: "bg-blue-500 text-white rounded-full",
          range_end: "bg-blue-500 text-white rounded-full",
        }}
      />

      <div className="mt-4 flex justify-between text-sm">
        <div>
          <span className="font-medium">Start:</span>{" "}
          {selectedRange.from
            ? selectedRange.from.toLocaleDateString()
            : "Not selected"}
        </div>
        <div>
          <span className="font-medium">End:</span>{" "}
          {selectedRange.to
            ? selectedRange.to.toLocaleDateString()
            : "Not selected"}
        </div>
      </div>
    </div>
  );
}
