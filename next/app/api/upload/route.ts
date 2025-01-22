import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { validateFile, generateFileName } from "@/app/lib/file";
import crypto from "crypto";

// Helper function to sign request
function generateSignature(stringToSign: string, secretKey: string) {
  return crypto
    .createHmac("sha1", secretKey)
    .update(stringToSign)
    .digest("base64");
}

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

    // Generate date for headers
    const date = new Date().toUTCString();
    const contentType = file.type;

    // Construct the string to sign
    const stringToSign = `PUT\n\n${contentType}\n${date}\n/${process.env.R2_BUCKET_NAME}/${fileName}`;
    const signature = generateSignature(
      stringToSign,
      process.env.R2_SECRET_ACCESS_KEY!
    );

    // Make direct request to R2
    const response = await fetch(
      `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileName}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          Date: date,
          Authorization: `AWS ${process.env.R2_ACCESS_TOKEN}:${signature}`,
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    // Generate a temporary signed URL for reading
    const expiresIn = 604800; // 7 days in seconds
    const expiry = Math.floor(Date.now() / 1000) + expiresIn;
    const readStringToSign = `GET\n\n\n${expiry}\n/${process.env.R2_BUCKET_NAME}/${fileName}`;
    const readSignature = generateSignature(
      readStringToSign,
      process.env.R2_SECRET_ACCESS_KEY!
    );

    const signedUrl = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${process.env.R2_BUCKET_NAME}/${fileName}?AWSAccessKeyId=${process.env.R2_ACCESS_TOKEN}&Expires=${expiry}&Signature=${encodeURIComponent(readSignature)}`;

    return NextResponse.json({ imageUrl: signedUrl });
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
