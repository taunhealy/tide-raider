"use client";

import { useState, useEffect, useMemo } from "react";
import { beachData } from "@/app/types/beaches";
import { format } from "date-fns";
import { Event } from "../types/events";

export default function EventsSidebar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    country: "",
    region: "",
    startTime: "",
    link: "",
  });

  // Extract unique countries and regions from beach data
  const { countries, regionsByCountry } = useMemo(() => {
    const uniqueCountries = Array.from(
      new Set(beachData.map((beach) => beach.country))
    ).sort();
    const regionMap = beachData.reduce(
      (acc, beach) => {
        if (!acc[beach.country]) {
          acc[beach.country] = new Set();
        }
        acc[beach.country].add(beach.region);
        return acc;
      },
      {} as Record<string, Set<string>>
    );

    // Convert Sets to sorted arrays
    const regionsByCountry = Object.fromEntries(
      Object.entries(regionMap).map(([country, regions]) => [
        country,
        Array.from(regions).sort(),
      ])
    );

    return { countries: uniqueCountries, regionsByCountry };
  }, []);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }
      const data = await response.json();
      // Ensure data is an array
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        resetForm();
        setShowForm(false);
        fetchEvents(); // Refresh events list
      }
    } catch (error) {
      console.error("Error creating event:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      country: "",
      region: "",
      startTime: "",
      link: "",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200 ">
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Upcoming Travel Video Premieres
          </h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="text-sm bg-[var(--color-bg-tertiary)] text-white px-4 py-2 rounded-md hover:opacity-90"
          >
            {showForm ? "Cancel" : "Add Event"}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-6 border-b border-gray-200">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="mt-2 block w-full px-4 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-2 block w-full px-4 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      country: e.target.value,
                      region: "", // Reset region when country changes
                    });
                  }}
                  className="mt-2 block w-full px-4 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Country</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Region
                </label>
                <select
                  required
                  value={formData.region}
                  onChange={(e) =>
                    setFormData({ ...formData, region: e.target.value })
                  }
                  className="mt-2 block w-full px-4 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  disabled={!formData.country}
                >
                  <option value="">Select Region</option>
                  {formData.country &&
                    regionsByCountry[formData.country]?.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                className="mt-2 block w-full px-4 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link (optional)
              </label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
                className="mt-2 block w-full px-4 py-2 text-sm rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[var(--color-bg-tertiary)] text-white text-sm py-3 px-6 rounded-md hover:opacity-90 transition-opacity"
            >
              Create Event
            </button>
          </div>
        </form>
      )}

      <div className="divide-y divide-gray-200">
        {Array.isArray(events) &&
          events.map((event) => (
            <div key={event.id} className="p-6">
              <h3 className="font-medium text-gray-900">{event.title}</h3>
              <p className="text-sm text-gray-600 mt-2">{event.description}</p>
              <div className="text-sm text-gray-500 mt-4">
                <p>{`${event.country}, ${event.region}`}</p>
                <p>{format(new Date(event.startTime), "PPP")}</p>
              </div>
              {event.link && (
                <a
                  href={event.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-bg-tertiary)] hover:underline text-sm mt-4 block"
                >
                  Learn more
                </a>
              )}
            </div>
          ))}
      </div>
    </div>
  );
}
