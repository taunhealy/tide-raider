import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/authOptions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const beachId = searchParams.get("beachId");
  const id = searchParams.get("id");

  // If beachId is provided, get ads for that beach
  if (beachId) {
    try {
      // Get active ads for this beach
      const ads = await prisma.ad.findMany({
        where: {
          status: "active",
          beachConnections: {
            some: {
              beachId: beachId,
            },
          },
          endDate: {
            gte: new Date(), // Only show ads that haven't expired
          },
        },
        orderBy: {
          createdAt: "desc", // Show newest ads first
        },
      });

      // Ensure we're returning an array
      return NextResponse.json({ ads: ads || [] });
    } catch (error) {
      console.error("Error fetching beach ads:", error);
      return NextResponse.json(
        { error: "Failed to fetch ads", ads: [] },
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
    const {
      title,
      companyName,
      contactEmail,
      linkUrl,
      category,
      regionId,
      targetedBeaches,
      yearlyPrice,
      websiteUrl,
    } = data;

    // Create ad request and ad together in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the ad request
      const adRequest = await prisma.adRequest.create({
        data: {
          id: `req_${Date.now()}`,
          companyName,
          title: companyName,
          contactEmail: session.user.email || "",
          linkUrl: websiteUrl || linkUrl,
          category,
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
        },
      });

      // Create the ad with beach connections
      const ad = await prisma.ad.create({
        data: {
          requestId: adRequest.id,
          companyName,
          title,
          category,
          linkUrl: websiteUrl || linkUrl,
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

      // Send email notification to admin
      if (process.env.ADMIN_EMAIL) {
        try {
          await fetch("/api/email/send", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: process.env.ADMIN_EMAIL,
              subject: "New Ad Created",
              text: `A new ad has been created:
                Company: ${companyName}
                Category: ${category}
                Region: ${regionId}
                Beach: ${targetedBeaches.join(", ")}
                View in dashboard: ${process.env.NEXTAUTH_URL}/dashboard/admin/ads
              `,
            }),
          });
        } catch (error) {
          console.error("Failed to send admin notification email:", error);
          // Don't fail the request if email fails
        }
      }

      return { adRequest, ad, adId: ad.id };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
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
