import { redis } from "@/app/lib/redis";

export async function GET() {
  try {
    // Test write
    await redis.set("test-key", "Hello from Redis!");

    // Test read
    const value = await redis.get("test-key");

    return Response.json({
      success: true,
      message: "Redis is working!",
      value,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Redis test error:", error);
    return Response.json(
      {
        success: false,
        error: (error as Error).message,
      },
      {
        status: 500,
      }
    );
  }
}
