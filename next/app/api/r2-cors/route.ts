import { NextResponse } from "next/server";
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_TOKEN || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
  forcePathStyle: true,
});

export async function POST() {
  try {
    console.log(
      "Attempting to set CORS for bucket:",
      process.env.R2_BUCKET_NAME
    );

    const command = new PutBucketCorsCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    });

    const result = await s3.send(command);
    console.log("CORS setup result:", result);

    return NextResponse.json({
      message: "CORS configuration updated successfully",
      result,
    });
  } catch (error) {
    console.error("Failed to update CORS:", error);
    return NextResponse.json(
      {
        error: "Failed to update CORS configuration",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
