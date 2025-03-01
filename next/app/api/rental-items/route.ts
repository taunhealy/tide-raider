import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { beachData } from "@/app/types/beaches"; // Import beachData

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const itemType = searchParams.get("itemType");
    const beachId = searchParams.get("beachId");
    const regionId = searchParams.get("regionId");
    const continent = searchParams.get("continent");
    const country = searchParams.get("country");
    const region = searchParams.get("region");
    const beach = searchParams.get("beach");
    const isActive = searchParams.get("isActive") !== "false"; // Default to true

    // Build the where clause
    const where: any = { isActive };

    if (itemType) {
      where.itemType = itemType;
    }

    if (beachId) {
      where.availableBeaches = {
        some: {
          beachId,
        },
      };
    }

    if (regionId) {
      where.availableBeaches = {
        some: {
          beach: {
            regionId,
          },
        },
      };
    }

    // Add filters for continent, country, region, and beach
    if (continent) {
      where.availableBeaches = {
        some: {
          beach: {
            region: {
              continent,
            },
          },
        },
      };
    }

    if (country) {
      where.availableBeaches = {
        some: {
          beach: {
            region: {
              country,
            },
          },
        },
      };
    }

    if (region) {
      where.availableBeaches = {
        some: {
          beach: {
            region: {
              name: region,
            },
          },
        },
      };
    }

    if (beach) {
      where.availableBeaches = {
        some: {
          beach: {
            name: beach,
          },
        },
      };
    }

    const rentalItems = await prisma.rentalItem.findMany({
      where,
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
                    country: true,
                    continent: true,
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

    return NextResponse.json(rentalItems);
  } catch (error) {
    console.error("Error fetching rental items:", error);
    return NextResponse.json(
      { error: "Failed to fetch rental items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      name,
      description,
      rentPrice,
      images,
      thumbnail,
      itemType,
      specifications,
      availableBeaches,
    } = await req.json();

    // First, ensure all selected beaches exist in the database
    if (availableBeaches && availableBeaches.length > 0) {
      for (const beachId of availableBeaches) {
        // Check if beach exists in database
        const existingBeach = await prisma.beach.findUnique({
          where: { id: beachId },
        });

        // If beach doesn't exist, create it from beachData
        if (!existingBeach) {
          const beachInfo = beachData.find((b) => b.id === beachId);
          if (beachInfo) {
            // First check if the region exists
            const existingRegion = await prisma.region.findUnique({
              where: { id: beachInfo.region },
            });

            // If region doesn't exist, create it
            if (!existingRegion) {
              await prisma.region.create({
                data: {
                  id: beachInfo.region,
                  name: beachInfo.region,
                  country: beachInfo.country,
                  continent: beachInfo.continent || null,
                },
              });
              console.log(`Created region: ${beachInfo.region}`);
            }

            // Now create the beach
            await prisma.beach.create({
              data: {
                id: beachInfo.id,
                name: beachInfo.name,
                location: beachInfo.location,
                country: beachInfo.country,
                regionId: beachInfo.region,
                continent: beachInfo.continent || "",
                distanceFromCT: beachInfo.distanceFromCT || 0,
                optimalWindDirections: beachInfo.optimalWindDirections || [],
                optimalSwellDirections: beachInfo.optimalSwellDirections || {},
                bestSeasons: beachInfo.bestSeasons || [],
                optimalTide: beachInfo.optimalTide || "",
                description: beachInfo.description || "",
                difficulty: beachInfo.difficulty || "",
                waveType: beachInfo.waveType || "",
                swellSize: beachInfo.swellSize || {},
                idealSwellPeriod: beachInfo.idealSwellPeriod || {},
                waterTemp: beachInfo.waterTemp || {},
                hazards: beachInfo.hazards || [],
                crimeLevel: beachInfo.crimeLevel || "",
                sharkAttack: beachInfo.sharkAttack
                  ? JSON.parse(JSON.stringify(beachInfo.sharkAttack))
                  : {},
                coordinates: beachInfo.coordinates || {},
                image: beachInfo.image,
                profileImage: beachInfo.profileImage,
                videos: beachInfo.videos,
              },
            });
            console.log(`Created beach: ${beachInfo.name}`);
          }
        }
      }
    }

    // Now create the rental item with beach connections
    const rentalItem = await prisma.rentalItem.create({
      data: {
        name,
        description,
        rentPrice,
        images: Array.isArray(images) ? images : [],
        thumbnail,
        itemType,
        specifications,
        isActive: true,
        userId: session.user.id,
        availableBeaches: {
          create: availableBeaches.map((beachId: string) => ({
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
      },
    });

    return NextResponse.json(rentalItem);
  } catch (error) {
    console.error("Error creating rental item:", error);
    return NextResponse.json(
      { error: "Failed to create rental item" },
      { status: 500 }
    );
  }
}
