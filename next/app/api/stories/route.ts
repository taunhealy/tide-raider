import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import { beachData } from "@/app/types/beaches";
export async function GET() {
  try {
    const stories = await prisma.story.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        beach: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Failed to fetch stories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Add user existence check
  const author = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true },
  });

  if (!author) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const date = formData.get("date") as string;
    const details = formData.get("details") as string;
    const category = formData.get("category") as string;
    const beach = formData.get("beach") as string;
    const isCustomBeach = formData.get("isCustomBeach") === "true";
    const link = formData.get("link") as string;

    // For non-custom beaches, ensure the beach exists in the database
    if (!isCustomBeach && beach !== "other") {
      const beachDataEntry = beachData.find((b) => b.id === beach);
      if (!beachDataEntry) {
        return NextResponse.json(
          { error: "Selected beach not found in beach data" },
          { status: 400 }
        );
      }

      // Create the region record if it doesn't exist
      await prisma.region.upsert({
        where: { id: beachDataEntry.region },
        update: {},
        create: {
          id: beachDataEntry.region,
          name: beachDataEntry.region,
          country: beachDataEntry.country || "",
          continent: beachDataEntry.continent || null,
        },
      });

      // Create the beach record if it doesn't exist
      await prisma.beach.upsert({
        where: { id: beach },
        update: {},
        create: {
          id: beachDataEntry.id,
          name: beachDataEntry.name,
          regionId: beachDataEntry.region,
          country: beachDataEntry.country || "",
          continent: beachDataEntry.continent || "",
          // Add other required fields with default values
          location: "",
          distanceFromCT: 0,
          optimalWindDirections: [],
          optimalSwellDirections: {},
          bestSeasons: [],
          optimalTide: "",
          description: "",
          difficulty: "",
          waveType: "",
          swellSize: {},
          idealSwellPeriod: {},
          waterTemp: {},
          hazards: [],
          crimeLevel: "",
          sharkAttack: {},
          coordinates: {},
        },
      });
    }

    // Create the story with region relation if beach is specified
    const storyData: any = {
      title,
      date: new Date(date),
      details,
      category,
      link: link || null,
      author: {
        connect: { id: author.id },
      },
    };

    if (!isCustomBeach && beach !== "other") {
      const beachDataEntry = beachData.find((b) => b.id === beach);
      storyData.beach = { connect: { id: beach } };
      storyData.region = { connect: { id: beachDataEntry?.region } };
    }

    const story = await prisma.story.create({
      data: storyData,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        beach: true,
        region: true,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error("Failed to create story:", error);
    return NextResponse.json(
      { error: "Failed to create story" },
      { status: 500 }
    );
  }
}
