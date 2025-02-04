"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import debounce from "lodash/debounce";

interface Airport {
  iataCode: string;
  name: string;
  address: {
    cityName: string;
    countryName: string;
  };
}

interface FlightSearchWidgetProps {
  title?: string;
  destinationCode: string;
}

interface FlightOffer {
  price: {
    total: string;
    currency: string;
  };
  itineraries: Array<{
    duration: string;
    segments: Array<{
      departure: {
        iataCode: string;
        at: string;
      };
      arrival: {
        iataCode: string;
        at: string;
      };
      carrierCode: string;
    }>;
  }>;
}

export default function FlightSearchWidget({
  title = "Find Flights",
  destinationCode: defaultDestinationCode,
}: FlightSearchWidgetProps) {
  const [departureCode, setDepartureCode] = useState("");
  const [destinationCode, setDestinationCode] = useState(
    defaultDestinationCode
  );
  const [departureSearch, setDepartureSearch] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [departureResults, setDepartureResults] = useState<Airport[]>([]);
  const [destinationResults, setDestinationResults] = useState<Airport[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize destination search with the default code
  useEffect(() => {
    if (defaultDestinationCode) {
      // Fetch initial airport details for the default destination
      const fetchDefaultAirport = async () => {
        const response = await fetch(
          `/api/airports/search?keyword=${defaultDestinationCode}`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.length > 0) {
            const airport = data[0];
            setDestinationSearch(
              `${airport.address.cityName} (${airport.iataCode})`
            );
          }
        }
      };
      fetchDefaultAirport();
    }
  }, [defaultDestinationCode]);

  const {
    data: flightOffers,
    isError,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["flights", departureCode, destinationCode],
    queryFn: async () => {
      const response = await fetch(
        `/api/flights?destination=${destinationCode}&departure=${departureCode}`
      );
      if (!response.ok) throw new Error("Failed to fetch flights");
      const data = await response.json();
      return data.data || [];
    },
    enabled: false, // Don't fetch automatically
    staleTime: 1000 * 60 * 5,
  });

  const searchAirports = async (keyword: string) => {
    if (keyword.length < 2) return [];
    const response = await fetch(
      `/api/airports/search?keyword=${encodeURIComponent(keyword)}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data;
  };

  const debouncedSearch = debounce(
    async (keyword: string, setResults: (results: Airport[]) => void) => {
      const results = await searchAirports(keyword);
      setResults(results);
    },
    300
  );

  const handleDepartureSearch = (value: string) => {
    setDepartureSearch(value);
    debouncedSearch(value, setDepartureResults);
  };

  const handleDestinationSearch = (value: string) => {
    setDestinationSearch(value);
    debouncedSearch(value, setDestinationResults);
  };

  const selectDepartureAirport = (airport: Airport) => {
    setDepartureCode(airport.iataCode);
    setDepartureSearch(`${airport.address.cityName} (${airport.iataCode})`);
    setDepartureResults([]);
  };

  const selectDestinationAirport = (airport: Airport) => {
    setDestinationCode(airport.iataCode);
    setDestinationSearch(`${airport.address.cityName} (${airport.iataCode})`);
    setDestinationResults([]);
  };

  const handleSearch = () => {
    setIsSearching(true);
    refetch();
  };

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-500 text-sm mb-2">
            Unable to load flight prices for {destinationCode}
          </p>
          <p className="text-gray-400 text-xs">Please try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="flight-search-container min-h-[300px] relative">
        <div className="mb-4 space-y-3">
          <div className="relative">
            <label
              htmlFor="departure"
              className="block text-sm font-medium text-gray-700"
            >
              Departure Airport
            </label>
            <input
              id="departure"
              type="text"
              value={departureSearch}
              onChange={(e) => handleDepartureSearch(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search by city or airport name"
            />
            {departureResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {departureResults.map((airport) => (
                  <button
                    key={airport.iataCode}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => selectDepartureAirport(airport)}
                  >
                    <div className="font-medium">
                      {airport.address.cityName} ({airport.iataCode})
                    </div>
                    <div className="text-sm text-gray-500">{airport.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="relative">
            <label
              htmlFor="destination"
              className="block text-sm font-medium text-gray-700"
            >
              Destination Airport
            </label>
            <input
              id="destination"
              type="text"
              value={destinationSearch}
              onChange={(e) => handleDestinationSearch(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search by city or airport name"
            />
            {destinationResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {destinationResults.map((airport) => (
                  <button
                    key={airport.iataCode}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100"
                    onClick={() => selectDestinationAirport(airport)}
                  >
                    <div className="font-medium">
                      {airport.address.cityName} ({airport.iataCode})
                    </div>
                    <div className="text-sm text-gray-500">{airport.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            disabled={!departureCode || !destinationCode}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Search Flights
          </button>
        </div>

        {isLoading || isSearching ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">Loading flight prices...</p>
          </div>
        ) : flightOffers?.length > 0 ? (
          <div className="space-y-4">
            {flightOffers
              .slice(0, 3)
              .map((offer: FlightOffer, index: number) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">
                        {offer.itineraries[0].segments[0].departure.iataCode} →{" "}
                        {destinationCode}
                      </p>
                      <p className="text-sm text-gray-500">
                        Duration: {offer.itineraries[0].duration}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">
                        {offer.price.currency} {offer.price.total}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              {isSearching
                ? "No flights available for this route"
                : "Enter airports and search for flights"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
