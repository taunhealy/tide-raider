import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import { beachData } from "@/app/types/beaches";
import { Region } from "@/app/types/beaches";
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

      // Create the beach record if it doesn't exist
      await prisma.beach.upsert({
        where: { id: beach },
        update: {},
        create: {
          id: beachDataEntry.id,
          name: beachDataEntry.name,
        },
      });
    }

    // Create the story
    const story = await prisma.story.create({
      data: {
        title,
        date: new Date(date),
        details,
        category,
        link: link || null,
        author: {
          connect: { email: session?.user?.email ?? "" },
        },
        ...(!isCustomBeach &&
          beach !== "other" && {
            beach: {
              connect: { id: beach },
            },
          }),
      },
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
