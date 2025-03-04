import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import { AD_CATEGORIES } from "@/app/lib/constants";
import { CreateAdRequestPayload } from "@/app/types/ads";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      title,
      companyName,
      contactEmail,
      linkUrl,
      category,
      regionId,
      targetedBeaches,
      status,
      yearlyPrice,
    } = (await request.json()) as CreateAdRequestPayload;

    // Validate required fields
    if (
      !title ||
      !linkUrl ||
      !category ||
      !regionId ||
      !targetedBeaches?.length
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if category is available for this beach
    const existingAd = await prisma.ad.findFirst({
      where: {
        targetedBeaches: {
          has: targetedBeaches[0],
        },
        category: category,
        status: "active",
        endDate: {
          gt: new Date(),
        },
      },
    });

    if (existingAd) {
      return NextResponse.json(
        { error: "This category is already taken for this beach" },
        { status: 409 }
      );
    }

    // Create AdRequest first
    const adRequest = await prisma.adRequest.create({
      data: {
        id: `req_${Date.now()}`,
        companyName: companyName || title,
        contactEmail: contactEmail || session.user.email,
        linkUrl,
        status: status || "PENDING",
        userId: user.id,
        category,
        regionId,
        title,
        yearlyPrice:
          yearlyPrice ||
          AD_CATEGORIES[category as keyof typeof AD_CATEGORIES]?.monthlyPrice *
            12 ||
          0,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        categoryData: {
          location: [regionId],
        },
        googleAdsContribution: 0,
      },
    });

    // Create ad with pending status
    const ad = await prisma.ad.create({
      data: {
        requestId: adRequest.id,
        companyName: companyName || title,
        title,
        linkUrl,
        category,
        regionId,
        targetedBeaches,
        status: "pending",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        userId: user.id,
      },
    });

    return NextResponse.json({ adId: ad.id });
  } catch (error) {
    console.error("Error creating ad:", error);
    return NextResponse.json({ error: "Failed to create ad" }, { status: 500 });
  }
}
