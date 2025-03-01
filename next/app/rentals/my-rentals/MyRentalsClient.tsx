"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

export default function MyRentalsClient() {
  // Fetch user's rental items
  const {
    data: rentalItems,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["myRentals"],
    queryFn: async () => {
      const response = await fetch("/api/rentals/my-rentals");
      if (!response.ok) {
        throw new Error("Failed to fetch rentals");
      }
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 font-primary">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Rental Listings</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-[var(--color-text-secondary)]">
            Loading your rentals...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-500">
          Error loading your rentals
        </h1>
        <p>
          There was a problem loading your listings. Please try again later.
        </p>
        <Link
          href="/rentals"
          className="mt-4 btn-tertiary inline-block px-4 py-2 rounded-md"
        >
          Back to Rentals
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 font-primary">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Rental Listings</h1>
        <Link
          href="/dashboard/rentals/new"
          className="btn-tertiary px-4 py-2 rounded-md"
        >
          List New Item
        </Link>
      </div>

      {rentalItems && rentalItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rentalItems.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg overflow-hidden hover:shadow-md transition"
            >
              <Link href={`/rentals/${item.id}`}>
                <div className="relative h-48 bg-gray-100">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-200">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-lg">{item.name}</h3>
                  <span className="text-[var(--color-tertiary)] font-medium">
                    ${item.rentPrice}/day
                  </span>
                </div>

                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {item.itemType}
                </p>

                {item.availableBeaches && item.availableBeaches.length > 0 && (
                  <p className="text-sm mt-2">
                    <span className="text-[var(--color-text-secondary)]">
                      Available at:{" "}
                    </span>
                    {item.availableBeaches.map((b) => b.beach.name).join(", ")}
                  </p>
                )}

                {item.rentalRequests && item.rentalRequests.length > 0 && (
                  <div className="mt-3 bg-yellow-50 text-yellow-800 text-sm p-2 rounded">
                    {item.rentalRequests.length} pending request
                    {item.rentalRequests.length > 1 ? "s" : ""}
                  </div>
                )}

                <div className="mt-4 flex space-x-2">
                  <Link
                    href={`/dashboard/rentals/${item.id}`}
                    className="text-sm btn-tertiary px-3 py-1 rounded"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/rentals/${item.id}`}
                    className="text-sm btn-tertiary px-3 py-1 rounded"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[var(--color-bg-secondary)] p-8 rounded-md text-center">
          <p className="text-[var(--color-text-secondary)]">
            You don't have any rental listings yet.
          </p>
          <Link
            href="/dashboard/rentals/new"
            className="btn-tertiary inline-block mt-4 px-4 py-2 rounded-md"
          >
            Create Your First Listing
          </Link>
        </div>
      )}
    </div>
  );
}
