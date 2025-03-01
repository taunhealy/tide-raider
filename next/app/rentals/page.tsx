import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/lib/prisma";
import RentalsClient from "./RentalsClient";

export const metadata = {
  title: "Rentals | Tide Raider",
  description:
    "Rent surfboards, motorbikes, and scooters for your surf adventure",
};

async function fetchRentalItems() {
  const rentalItems = await prisma.rentalItem.findMany({
    where: {
      isActive: true,
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
      availableBeaches: {
        include: {
          beach: {
            select: {
              id: true,
              name: true,
              region: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return rentalItems;
}

async function fetchRegions() {
  const regions = await prisma.region.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return regions;
}

export default async function RentalsPage() {
  const session = await getServerSession(authOptions);
  const [rentalItems, regions] = await Promise.all([
    fetchRentalItems(),
    fetchRegions(),
  ]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RentalsClient
        initialRentalItems={rentalItems}
        initialRegions={regions}
        session={session}
      />
    </Suspense>
  );
}
