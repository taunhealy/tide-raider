import { CloudflareImage } from "@/components/CloudflareImage";
import { BoardImageGallery } from "@/components/BoardImageGallery";
import { ContactOwnerButton } from "@/app/components/ContactOwnerButton";
import { BoardContactForm } from "@/app/components/boards/BoardContactForm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { SubscriptionStatus } from "@/app/types/subscription";

// Fix the API URL issue
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default async function BoardPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  try {
    // Use absolute URL with origin for server-side fetching
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const response = await fetch(`${origin}/api/boards/${params.id}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch board: ${response.status}`);
    }

    const board = await response.json();

    // Check if user is subscribed (for rental functionality)
    let isSubscribed = false;
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionStatus: true, hasActiveTrial: true },
      });
      isSubscribed =
        user?.subscriptionStatus === SubscriptionStatus.ACTIVE ||
        user?.hasActiveTrial === true;
    }

    return (
      <div className="max-w-7xl mx-auto p-6 font-primary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <BoardImageGallery
            images={board.images}
            thumbnail={board.thumbnail}
            boardName={board.name}
          />

          {/* Board Details */}
          <div className="space-y-6">
            <h1 className="text-3xl font-bold font-primary">{board.name}</h1>

            {board.isForRent && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-2 font-primary">
                  Rental Information
                </h2>
                <p className="text-lg font-primary">
                  R{board.rentPrice} for 2 weeks
                </p>
                <h3 className="font-medium mt-4 mb-2 font-primary">
                  Available for meetup at:
                </h3>
                <div className="flex flex-wrap gap-2">
                  {board.availableBeaches.map(
                    (connection: { beach: { id: string; name: string } }) => (
                      <span
                        key={connection.beach.id}
                        className="bg-white px-3 py-1 rounded-full border font-primary"
                      >
                        {connection.beach.name}
                      </span>
                    )
                  )}
                </div>

                {/* Rental Request Form - only show if user is subscribed */}
                {session ? (
                  isSubscribed ? (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-3 font-primary">
                        Request to Rent
                      </h3>
                      <BoardContactForm
                        boardId={board.id}
                        availableBeaches={board.availableBeaches.map(
                          (connection: {
                            beach: { id: string; name: string };
                          }) => connection.beach
                        )}
                      />
                    </div>
                  ) : (
                    <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
                      <p className="font-primary">
                        You need an active subscription to request board
                        rentals.
                      </p>
                      <Link
                        href="/pricing"
                        className="btn-primary mt-2 inline-block"
                      >
                        View Subscription Plans
                      </Link>
                    </div>
                  )
                ) : (
                  <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                    <p className="font-primary">
                      Please sign in to request board rentals.
                    </p>
                    <Link
                      href="/login"
                      className="btn-primary mt-2 inline-block"
                    >
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Contact Owner Button - always show */}
                <div className="mt-4">
                  <ContactOwnerButton
                    ownerEmail={board.user.email}
                    ownerName={board.user.name}
                  />
                </div>
              </div>
            )}

            {/* Board Specifications */}
            <div className="space-y-2">
              <p className="font-primary">
                <span className="font-medium">Type:</span>{" "}
                {board.type.replace("_", " ")}
              </p>
              <p className="font-primary">
                <span className="font-medium">Length:</span> {board.length}{" "}
                inches
              </p>
              <p className="font-primary">
                <span className="font-medium">Fin Setup:</span>{" "}
                {board.finSetup.replace("_", " ")}
              </p>
            </div>

            {/* Board Owner Info */}
            <div className="mt-6 flex items-center space-x-3">
              {board.user.image && (
                <img
                  src={board.user.image}
                  alt={board.user.name}
                  className="h-10 w-10 rounded-full"
                />
              )}
              <div>
                <p className="font-primary font-medium">
                  Listed by {board.user.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading board:", error);
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-500">Error loading board</h1>
        <p>There was a problem loading this board. Please try again later.</p>
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
          {error.message}
        </pre>
        <Link href="/boards" className="mt-4 btn-primary inline-block">
          Back to Boards
        </Link>
      </div>
    );
  }
}
