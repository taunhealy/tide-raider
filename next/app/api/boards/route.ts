import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { beachData } from "@/app/types/beaches";
import { BoardType, FinType } from "@prisma/client";

export async function POST(req: NextRequest) {
  console.log("POST /api/boards - Starting board creation");

  try {
    // Parse the request body first to ensure we can read it
    const body = await req.json();
    console.log("Received data:", JSON.stringify(body));

    // Get the current user session
    console.log("Getting user session");
    const session = await getServerSession(authOptions);
    console.log("Full session data:", JSON.stringify(session));

    if (!session?.user?.email) {
      console.log("No user session found");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("User session found for:", session.user.email);

    // Check if there's a user ID directly in the session
    if (session.user.id) {
      console.log("User ID found directly in session:", session.user.id);

      // Create the board using the ID from the session
      console.log("Creating board in database with user ID from session");
      const board = await prisma.board.create({
        data: {
          name: body.name,
          type: body.type,
          length: parseFloat(body.length.toString()),
          finSetup: body.finSetup,
          isForRent: body.isForRent || false,
          isForSale: body.isForSale || false,
          rentPrice: body.rentPrice || null,
          salePrice: body.salePrice || null,
          thumbnail: body.thumbnail || null,
          images: Array.isArray(body.images)
            ? body.images.filter((img) => img !== null)
            : [],
          userId: session.user.id,
        },
      });
      console.log("Board created successfully, id:", board.id);

      // Return the created board
      return Response.json(board);
    }

    // If no ID in session, try to find the user by email
    console.log(
      "No ID in session, finding user in database with email:",
      session.user.email
    );
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    console.log("User lookup result:", user ? "Found" : "Not found");

    if (!user) {
      console.log("User not found in database");
      return Response.json({ error: "User not found" }, { status: 404 });
    }
    console.log("User found in database, id:", user.id);

    // Create the board
    console.log("Creating board in database");
    const board = await prisma.board.create({
      data: {
        name: body.name,
        type: body.type,
        length: parseFloat(body.length.toString()),
        finSetup: body.finSetup,
        isForRent: body.isForRent || false,
        isForSale: body.isForSale || false,
        rentPrice: body.rentPrice || null,
        salePrice: body.salePrice || null,
        thumbnail: body.thumbnail || null,
        images: Array.isArray(body.images)
          ? body.images.filter((img) => img !== null)
          : [],
        userId: user.id,
      },
    });
    console.log("Board created successfully, id:", board.id);

    // Return the created board
    return Response.json(board);
  } catch (error: any) {
    console.error("Error creating board:", error);
    return Response.json(
      { error: error.message || "Failed to create board" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const beachId = searchParams.get("beachId");
  const region = searchParams.get("region");
  const type = searchParams.get("type");
  const forRent = searchParams.get("forRent");
  const forSale = searchParams.get("forSale");

  console.time("boardsQuery"); // Add timing

  // Build optimized where clause
  const where: any = {};

  // Add listing type filter
  if (forRent === "true") {
    where.isForRent = true;
  }

  if (forSale === "true") {
    where.isForSale = true;
  }

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

  // Limit the fields you're selecting and include only what you need
  const boards = await prisma.board.findMany({
    where,
    select: {
      id: true,
      name: true,
      type: true,
      length: true,
      finSetup: true,
      isForRent: true,
      rentPrice: true,
      isForSale: true,
      salePrice: true,
      thumbnail: true,
      availableBeaches: {
        select: {
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
        take: 5, // Limit the number of beaches per board
      },
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    take: 20, // Limit results to improve performance
  });

  console.timeEnd("boardsQuery"); // Log timing
  console.log(`Fetched ${boards.length} boards`);

  return Response.json(boards);
}
