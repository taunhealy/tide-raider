import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const beachId = searchParams.get("beachId");
  const id = searchParams.get("id");
  const type = searchParams.get("type");
  const category = searchParams.get("category");

  // If requesting adventure ads
  if (type === "adventure") {
    try {
      // Get active adventure ads
      const ads = await prisma.ad.findMany({
        where: {
          status: "active",
          categoryType: "adventure",
          endDate: {
            gte: new Date(), // Only show ads that haven't expired
          },
        },
        orderBy: {
          createdAt: "desc", // Show newest ads first
        },
        select: {
          id: true,
          companyName: true,
          title: true,
          description: true,
          category: true,
          linkUrl: true,
          imageUrl: true,
          status: true,
        },
      });

      return NextResponse.json({ ads: ads || [] });
    } catch (error) {
      console.error("Error fetching adventure ads:", error);
      return NextResponse.json(
        { error: "Failed to fetch ads", ads: [] },
        { status: 500 }
      );
    }
  }

  // If beachId is provided, get ads for that beach
  if (beachId && category) {
    try {
      // First check if the beach exists in the database
      const beach = await prisma.beach.findUnique({
        where: { id: beachId },
        select: { id: true, name: true },
      });

      if (!beach) {
        console.log(`Beach ${beachId} not found in database`);
        return NextResponse.json({
          available: false,
          beachExists: false,
          message: "Beach not found in database. Please select a valid beach.",
        });
      }

      // Check if there are any active ads for this beach and category
      const ads = await prisma.ad.findMany({
        where: {
          status: "active",
          category: category,
          categoryType: type || "local",
          beachConnections: {
            some: {
              beachId: beachId,
            },
          },
          endDate: {
            gte: new Date(), // Only show ads that haven't expired
          },
        },
        select: {
          id: true,
          companyName: true,
          title: true,
          description: true,
          category: true,
          linkUrl: true,
          imageUrl: true,
          status: true,
        },
      });

      // Return availability information
      return NextResponse.json({
        ads: ads || [],
        available: ads.length === 0,
        beachExists: true,
      });
    } catch (error) {
      console.error("Error checking availability:", error);
      return NextResponse.json(
        {
          error: "Failed to check availability",
          available: false,
          hasError: true,
        },
        { status: 500 }
      );
    }
  }

  // If id is provided, get a specific ad
  if (id) {
    try {
      const ad = await prisma.ad.findUnique({
        where: { id },
        include: { adRequest: true, beachConnections: true },
      });

      if (!ad) {
        return NextResponse.json({ error: "Ad not found" }, { status: 404 });
      }

      return NextResponse.json(ad);
    } catch (error) {
      console.error("Error fetching ad:", error);
      return NextResponse.json(
        { error: "Failed to fetch ad" },
        { status: 500 }
      );
    }
  }

  // If no specific parameters, return all ads (with proper authorization)
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ads = await prisma.ad.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        adRequest: true,
        beachConnections: true,
        _count: {
          select: {
            clicks: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ ads });
  } catch (error) {
    console.error("Error fetching ads:", error);
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Received ad creation request with data:", data);

    const {
      title,
      companyName,
      contactEmail,
      linkUrl,
      description,
      category,
      categoryType,
      customCategory,
      regionId,
      targetedBeaches,
      yearlyPrice,
      imageUrl,
    } = data;

    console.log("Processing ad with image URL:", imageUrl);

    // Create ad request and ad together in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the ad request
      const adRequest = await prisma.adRequest.create({
        data: {
          id: `req_${Date.now()}`,
          companyName,
          title: companyName,
          contactEmail: session.user.email || "",
          linkUrl: linkUrl,
          description,
          category,
          categoryType: categoryType || "local",
          customCategory,
          regionId,
          yearlyPrice,
          status: "PENDING",
          userId: session.user.id,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          googleAdsContribution: 0,
          categoryData: {
            location: [regionId],
          },
          imageUrl: imageUrl || null, // Ensure imageUrl is saved
        },
      });

      console.log("Created ad request:", adRequest.id);

      // Create the ad with beach connections
      const ad = await prisma.ad.create({
        data: {
          requestId: adRequest.id,
          companyName,
          title,
          description,
          category,
          categoryType: categoryType || "local",
          customCategory,
          linkUrl,
          imageUrl: imageUrl || null, // Ensure imageUrl is saved
          regionId,
          status: "pending",
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          userId: session.user.id,
          beachConnections: {
            create: targetedBeaches.map((beachId: string) => ({
              beachId,
            })),
          },
        },
      });

      console.log("Created ad:", ad.id, "with imageUrl:", imageUrl);

      return { adRequest, ad };
    });

    return NextResponse.json({
      success: true,
      adId: result.ad.id,
      requestId: result.adRequest.id,
    });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create ad",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
  }

  try {
    const { status } = await request.json();

    const ad = await prisma.ad.findUnique({
      where: { id },
      include: { adRequest: true },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Update ad status
    const updatedAd = await prisma.ad.update({
      where: { id },
      data: {
        status,
        ...(status === "cancelled" ? { endDate: new Date() } : {}),
      },
    });

    // Update ad request status if it exists
    if (ad.adRequest) {
      await prisma.adRequest.update({
        where: { id: ad.adRequest.id },
        data: {
          status: status === "cancelled" ? "CANCELLED" : status.toUpperCase(),
        },
      });
    }

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json({ error: "Failed to update ad" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!id) {
    return NextResponse.json({ error: "Ad ID is required" }, { status: 400 });
  }

  try {
    const ad = await prisma.ad.findUnique({
      where: { id },
      include: { adRequest: true, beachConnections: true },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete in a transaction to ensure all related records are deleted
    await prisma.$transaction(async (prisma) => {
      // Delete beach connections first
      await prisma.adBeachConnection.deleteMany({
        where: { adId: id },
      });

      // Delete the ad
      await prisma.ad.delete({
        where: { id },
      });

      // Delete the ad request if it exists
      if (ad.adRequest) {
        await prisma.adRequest.delete({
          where: { id: ad.adRequest.id },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting ad:", error);
    return NextResponse.json({ error: "Failed to delete ad" }, { status: 500 });
  }
}
