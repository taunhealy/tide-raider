import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const ad = await prisma.ad.findUnique({
      where: { id: params.id },
    });

    if (!ad) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (ad.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(ad);
  } catch (error) {
    console.error("Error fetching ad:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Received data for update:", data);
    console.log("Image URL in request:", data.imageUrl);

    // Verify ownership
    const existingAd = await prisma.ad.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        imageUrl: true,
      },
    });

    if (!existingAd) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (existingAd.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("Existing image URL:", existingAd.imageUrl);

    // Create an update object with explicit typing
    const updateData: {
      title: string;
      companyName: string;
      linkUrl: string;
      category: string;
      regionId: string;
      categoryType: string;
      imageUrl: string | null | undefined;
      description?: string;
    } = {
      title: data.title,
      companyName: data.companyName,
      linkUrl: data.linkUrl,
      category: data.category,
      regionId: data.regionId,
      categoryType: data.categoryType,
      imageUrl: data.imageUrl, // Always include imageUrl in the update
    };

    // Add description if it exists in the data
    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    console.log("Update data being sent to Prisma:", updateData);

    // Update the ad
    const updatedAd = await prisma.ad.update({
      where: { id: params.id },
      data: updateData,
    });

    console.log("Updated ad with new image URL:", updatedAd.imageUrl);

    return NextResponse.json(updatedAd);
  } catch (error) {
    console.error("Error updating ad:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { imageUrl } = await request.json();
    console.log("Received image update request:", {
      adId: params.id,
      imageUrl,
    });

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Verify ownership
    const existingAd = await prisma.ad.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, imageUrl: true },
    });

    if (!existingAd) {
      return NextResponse.json({ error: "Ad not found" }, { status: 404 });
    }

    if (existingAd.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    console.log("Current image URL:", existingAd.imageUrl);

    // Update only the image URL
    const updatedAd = await prisma.ad.update({
      where: { id: params.id },
      data: { imageUrl },
    });

    console.log("Updated image URL:", updatedAd.imageUrl);

    return NextResponse.json({ success: true, imageUrl: updatedAd.imageUrl });
  } catch (error) {
    console.error("Error updating image URL:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
