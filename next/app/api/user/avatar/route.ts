import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import S3 from "@/app/lib/r2";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    const uniqueFilename = `${uuidv4()}-${file.name}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    await S3.send(
      new PutObjectCommand({
        Bucket: "tide-raider",
        Key: uniqueFilename,
        Body: buffer,
        ContentType: file.type,
      })
    );

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: `https://pub-e0916b639e6769b291e0f513d85545da.r2.dev/${uniqueFilename}`,
      },
      select: {
        image: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (err) {
    console.error("Avatar update error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
