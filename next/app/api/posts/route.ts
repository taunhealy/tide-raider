import { NextResponse } from "next/server";
import { client } from "@/app/lib/sanity";
import { blogListingQuery } from "@/app/lib/queries";

export async function GET() {
  try {
    const data = await client.fetch(blogListingQuery);

    // Filter out posts without slugs
    if (data?.posts) {
      data.posts = data.posts.filter((post: any) => post.hasSlug && post.slug);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog posts" },
      { status: 500 }
    );
  }
}
