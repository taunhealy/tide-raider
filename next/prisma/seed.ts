require("./seeds/ads");

import { PrismaClient } from "@prisma/client";
import { beachData } from "../app/types/beaches";
import { RentalItemType, PACKAGE_PRICES } from "../app/lib/rentals/constants";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed script...");

  // Use the specific user ID
  const userId = "cm7r7r1440000v0h0ew4kmvdq";

  console.log(`Looking for user with ID: ${userId}`);
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error(
      `User with ID ${userId} not found. Please provide a valid user ID.`
    );
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (${user.email})`);

  // Select a few beaches for the rental item
  const selectedBeaches = beachData.slice(0, 3); // Take first 3 beaches
  console.log("Selected beaches for rental item:");
  selectedBeaches.forEach((beach) =>
    console.log(`- ${beach.name} (ID: ${beach.id})`)
  );

  // Ensure the beaches exist in the database
  for (const beach of selectedBeaches) {
    console.log(`Checking if beach exists: ${beach.name}`);
    const existingBeach = await prisma.beach.findUnique({
      where: { id: beach.id },
    });

    if (!existingBeach) {
      console.log(
        `Beach not found, checking if region exists: ${beach.region}`
      );
      // Check if region exists
      const existingRegion = await prisma.region.findUnique({
        where: { id: beach.region },
      });

      // Create region if it doesn't exist
      if (!existingRegion) {
        console.log(`Creating region: ${beach.region}`);
        await prisma.region.create({
          data: {
            id: beach.region,
            name: beach.region,
            country: beach.country || "",
            continent: beach.continent || "",
          },
        });
      }

      // Create the beach
      console.log(`Creating beach: ${beach.name}`);
      await prisma.beach.create({
        data: {
          id: beach.id,
          name: beach.name,
          location: beach.location || "",
          country: beach.country || "",
          regionId: beach.region,
          continent: beach.continent || "",
          distanceFromCT: beach.distanceFromCT || 0,
          optimalWindDirections: beach.optimalWindDirections || [],
          optimalSwellDirections: beach.optimalSwellDirections || {},
          bestSeasons: beach.bestSeasons || [],
          optimalTide: beach.optimalTide || "",
          description: beach.description || "",
          difficulty: beach.difficulty || "",
          waveType: beach.waveType || "",
          swellSize: beach.swellSize || {},
          idealSwellPeriod: beach.idealSwellPeriod || {},
          waterTemp: beach.waterTemp || {},
          hazards: beach.hazards || [],
          crimeLevel: beach.crimeLevel || "",
          sharkAttack: beach.sharkAttack
            ? JSON.parse(JSON.stringify(beach.sharkAttack))
            : {},
          coordinates: beach.coordinates || {},
          image: beach.image,
          profileImage: beach.profileImage,
          videos: beach.videos || {},
        },
      });
    } else {
      console.log(`Beach already exists: ${beach.name}`);
    }
  }

  // Create Jet Ski rental item
  console.log("Creating Jet Ski rental item...");
  const jetSkiSpecs = {
    make: "Sea-Doo",
    model: "WAKE PRO",
    year: 2023,
    horsepower: 230,
    fuelCapacity: 70,
    riderCapacity: 3,
  };

  const jetSki = await prisma.rentalItem.create({
    data: {
      name: "WAKE PRO",
      description:
        "THE WAKE PRO MODEL DELIVERS THE MOST STABLE RIDE IN THE INDUSTRY. WITH EXTRA SPACE FOR SET-UP, EASY BOARDING, AND A SERIOUS 100W BLUETOOTH AUDIO SYSTEM, THESE MODELS AREN'T KIDDING AROUND.",
      rentPrice: 150,
      images: [
        "https://example.com/wake-pro-1.jpg",
        "https://example.com/wake-pro-2.jpg",
      ],
      thumbnail: "https://example.com/wake-pro-thumbnail.jpg",
      itemType: "JET_SKI",
      specifications: jetSkiSpecs,
      isActive: true,
      userId: userId,
      availableBeaches: {
        create: selectedBeaches.map((beach) => ({
          beachId: beach.id,
        })),
      },
    },
    include: {
      availableBeaches: {
        include: {
          beach: true,
        },
      },
    },
  });

  console.log(`Created Jet Ski with ID: ${jetSki.id}`);
  console.log("Jet Ski details:", JSON.stringify(jetSki, null, 2));

  console.log("Seed script completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error in seed script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
