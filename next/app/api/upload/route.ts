import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { validateFile, generateFileName } from "@/app/lib/file";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@aws-sdk/node-http-handler";

const s3 = new S3Client({
  region: "auto",
  endpoint: "https://e0916b639e6769b291e0f513d85545da.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: "ae6dd1cc7a8b98f2bbc42cdd15af8f43",
    secretAccessKey:
      "85d9c63d875a9c714a4dc1de6a380a2bad5b2fd528af3ecd8f92c249ed32ee0c",
  },
  requestHandler: new NodeHttpHandler({
    httpsAgent: new (require("https").Agent)({
      rejectUnauthorized: false,
    }),
  }),
  forcePathStyle: true,
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `sessions/${generateFileName(file.name)}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
    });

    await s3.send(command);

    const imageUrl = `${process.env.NEXT_PUBLIC_R2_URL}/${fileName}`;
    return NextResponse.json({ imageUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Failed to upload image",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
