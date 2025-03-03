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

  // Create Kayak rental item
  console.log("Creating Kayak rental item...");
  const kayakSpecs = {
    type: "SEA",
    length: 14,
    material: "FIBERGLASS",
    paddlesIncluded: 2,
  };

  const kayak = await prisma.rentalItem.create({
    data: {
      name: "Ocean Explorer Sea Kayak (Dev Test)",
      description:
        "This high-performance sea kayak is perfect for coastal exploration and longer journeys. Featuring a sleek fiberglass hull for excellent tracking and speed, adjustable footrests and seat for comfort during extended paddling sessions, and ample storage compartments for gear. The kayak comes with two lightweight carbon fiber paddles, spray skirts, and safety equipment. Suitable for intermediate to advanced paddlers looking to explore coastlines and open water.",
      rentPrice: PACKAGE_PRICES["KAYAK"],
      images: [
        "https://example.com/sea-kayak-1.jpg",
        "https://example.com/sea-kayak-2.jpg",
      ],
      thumbnail: "https://example.com/sea-kayak-1.jpg",
      itemType: "KAYAK",
      specifications: kayakSpecs,
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

  console.log(`Created Kayak with ID: ${kayak.id}`);
  console.log("Kayak details:", JSON.stringify(kayak, null, 2));

  // Create Foil rental item
  console.log("Creating Foil rental item...");
  const foilSpecs = {
    type: "WING",
    mastLength: 85,
    wingSize: 1500,
    material: "CARBON",
    boardIncluded: true,
  };

  const foil = await prisma.rentalItem.create({
    data: {
      name: "Pro Carbon Wing Foil Complete Package (Dev Test)",
      description:
        "This premium wing foiling package includes everything you need to get on the water. The carbon fiber hydrofoil features an 85cm mast and a high-aspect 1500cm² front wing designed for early lift and stability. The package includes a compact 4'8\" foil board with foot straps, a 5m inflatable wing with window, pump, leash, and carrying case. Perfect for intermediate to advanced riders looking to experience the thrill of wing foiling in a variety of wind conditions.",
      rentPrice: PACKAGE_PRICES["FOIL"],
      images: [
        "https://example.com/wing-foil-1.jpg",
        "https://example.com/wing-foil-2.jpg",
      ],
      thumbnail: "https://example.com/wing-foil-1.jpg",
      itemType: "FOIL",
      specifications: foilSpecs,
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

  console.log(`Created Foil with ID: ${foil.id}`);
  console.log("Foil details:", JSON.stringify(foil, null, 2));

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
