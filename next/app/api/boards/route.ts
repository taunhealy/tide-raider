import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { beachData } from "@/app/types/beaches";
import { BoardType, FinType } from "@prisma/client";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const data = await req.json();

  // Validate required fields
  if (
    !data.name ||
    !data.type ||
    !data.length ||
    !data.finSetup ||
    !data.images?.length
  ) {
    return new Response("Missing required fields", { status: 400 });
  }

  // Validate type and finSetup are valid enum values
  if (!Object.values(BoardType).includes(data.type)) {
    return new Response("Invalid board type", { status: 400 });
  }

  if (!Object.values(FinType).includes(data.finSetup)) {
    return new Response("Invalid fin setup", { status: 400 });
  }

  // Validate length is a number
  const length = parseFloat(data.length);
  if (isNaN(length)) {
    return new Response("Length must be a number", { status: 400 });
  }

  const {
    name,
    type,
    finSetup,
    images,
    availableBeaches,
    isForRent,
    rentPrice,
  } = data;

  // Create or update beaches and their connections
  const beachConnections = await Promise.all(
    availableBeaches.map(async (beachId: string) => {
      // Find beach data from beaches.ts
      const beachInfo = beachData.find((b) => b.id === beachId);
      if (!beachInfo) throw new Error(`Beach not found: ${beachId}`);

      // Create or update beach in database
      const beach = await prisma.beach.upsert({
        where: { id: beachId },
        update: {}, // No updates needed if exists
        create: {
          id: beachId,
          name: beachInfo.name,
          continent: beachInfo.continent,
          country: beachInfo.country,
          region: {
            connect: { id: beachInfo.region },
          },
          location: beachInfo.location,
          distanceFromCT: beachInfo.distanceFromCT,
          optimalWindDirections: beachInfo.optimalWindDirections,
          optimalSwellDirections: beachInfo.optimalSwellDirections,
          bestSeasons: beachInfo.bestSeasons,
          optimalTide: beachInfo.optimalTide,
          description: beachInfo.description,
          difficulty: beachInfo.difficulty,
          waveType: beachInfo.waveType,
          swellSize: beachInfo.swellSize,
          idealSwellPeriod: beachInfo.idealSwellPeriod,
          waterTemp: beachInfo.waterTemp,
          hazards: beachInfo.hazards,
          crimeLevel: beachInfo.crimeLevel,
          sharkAttack: JSON.parse(JSON.stringify(beachInfo.sharkAttack)),
          image: beachInfo.image || "",
          coordinates: beachInfo.coordinates,
          isHiddenGem: beachInfo.isHiddenGem || false,
          sheltered: beachInfo.sheltered || false,
        },
      });

      return beachId;
    })
  );

  // Create board with beach connections
  const board = await prisma.board.create({
    data: {
      name,
      type,
      length,
      finSetup,
      isForRent,
      rentPrice,
      images,
      thumbnail: images[0],
      userId: session.user.id,
      availableBeaches: {
        create: beachConnections.map((beachId) => ({
          beachId,
        })),
      },
    },
    include: {
      availableBeaches: {
        include: {
          beach: true,
        },
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return Response.json(board);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const beachId = searchParams.get("beachId");
  const region = searchParams.get("region");
  const type = searchParams.get("type");

  // Build the where clause based on filters
  const where: any = {
    isForRent: true,
    user: {
      subscriptionStatus: "ACTIVE", // Only show boards from subscribed users
    },
  };

  // Add beach filter if specified
  if (beachId) {
    where.availableBeaches = {
      some: { beachId },
    };
  }

  // Add region filter if specified
  if (region) {
    where.availableBeaches = {
      some: {
        beach: {
          regionId: region,
        },
      },
    };
  }

  // Add board type filter if specified
  if (type) {
    where.type = type;
  }

  // Add fin setup filter if specified
  if (searchParams.get("finSetup")) {
    where.finSetup = searchParams.get("finSetup");
  }

  const boards = await prisma.board.findMany({
    where,
    include: {
      availableBeaches: {
        include: {
          beach: true,
        },
      },
      user: {
        select: {
          name: true,
          image: true,
          subscriptionStatus: true,
        },
      },
    },
  });

  return Response.json(boards);
}
