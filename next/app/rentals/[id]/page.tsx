import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { RentalRequestForm } from "@/app/components/rentals/RentalRequestForm";
import { ContactOwnerButton } from "@/app/components/ContactOwnerButton";
import { SubscriptionStatus } from "@/app/types/subscription";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const rentalItem = await prisma.rentalItem.findUnique({
    where: { id: params.id },
    select: { name: true, itemType: true },
  });

  if (!rentalItem) {
    return {
      title: "Item Not Found | Surf Safari",
    };
  }

  return {
    title: `${rentalItem.name} | Surf Safari Rentals`,
    description: `Rent this ${rentalItem.itemType.toLowerCase()} for your next surf adventure`,
  };
}

export default async function RentalItemPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  try {
    const rentalItem = await prisma.rentalItem.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
          },
        },
        availableBeaches: {
          include: {
            beach: {
              select: {
                id: true,
                name: true,
                region: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!rentalItem) {
      return notFound();
    }

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

    // Format specifications based on item type
    const specs = rentalItem.specifications as any;
    let formattedSpecs: React.ReactNode = null;

    switch (rentalItem.itemType) {
      case "SURFBOARD":
        formattedSpecs = (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Type:</span>{" "}
              {specs.type?.replace("_", " ")}
            </p>
            <p>
              <span className="font-medium">Length:</span> {specs.length}"
              inches
            </p>
            <p>
              <span className="font-medium">Fin Setup:</span>{" "}
              {specs.finSetup?.replace("_", " ")}
            </p>
          </div>
        );
        break;
      case "MOTORBIKE":
        formattedSpecs = (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Make:</span> {specs.make}
            </p>
            <p>
              <span className="font-medium">Model:</span> {specs.model}
            </p>
            <p>
              <span className="font-medium">Year:</span> {specs.year}
            </p>
            <p>
              <span className="font-medium">Engine Size:</span>{" "}
              {specs.engineSize}cc
            </p>
          </div>
        );
        break;
      case "SCOOTER":
        formattedSpecs = (
          <div className="space-y-2">
            <p>
              <span className="font-medium">Make:</span> {specs.make}
            </p>
            <p>
              <span className="font-medium">Model:</span> {specs.model}
            </p>
            <p>
              <span className="font-medium">Year:</span> {specs.year}
            </p>
            <p>
              <span className="font-medium">Max Speed:</span> {specs.maxSpeed}
              km/h
            </p>
          </div>
        );
        break;
    }

    return (
      <div className="max-w-7xl mx-auto p-6 font-primary">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
              {rentalItem.thumbnail ? (
                <Image
                  src={`https://imagedelivery.net/your-account-hash/${rentalItem.thumbnail}/public`}
                  alt={rentalItem.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>

            {rentalItem.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {rentalItem.images.map((imageId) => (
                  <div
                    key={imageId}
                    className="relative h-20 bg-gray-100 rounded overflow-hidden"
                  >
                    <Image
                      src={`https://imagedelivery.net/your-account-hash/${imageId}/public`}
                      alt={rentalItem.name}
                      fill
                      sizes="25vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {rentalItem.itemType}
                </span>
                {rentalItem.isActive ? (
                  <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Available
                  </span>
                ) : (
                  <span className="ml-2 bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
                    Unavailable
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-bold mt-2">{rentalItem.name}</h1>
              <p className="text-2xl font-semibold text-blue-600 mt-2">
                R{rentalItem.rentPrice}/day
              </p>
            </div>

            {rentalItem.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-700">{rentalItem.description}</p>
              </div>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-2">Specifications</h2>
              {formattedSpecs}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-2">
                Available Pickup/Dropoff Locations
              </h2>
              <div className="flex flex-wrap gap-2">
                {rentalItem.availableBeaches.map((connection) => (
                  <span
                    key={connection.beach.id}
                    className="bg-gray-100 px-3 py-1 rounded-full text-sm"
                  >
                    {connection.beach.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-4 border-t">
              {rentalItem.user.image && (
                <Image
                  src={rentalItem.user.image}
                  alt={rentalItem.user.name}
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              )}
              <div>
                <p className="font-medium">Listed by {rentalItem.user.name}</p>
              </div>
            </div>

            {/* Rental Request Form - only show if user is logged in, subscribed, and not the owner */}
            {session ? (
              session.user.id !== rentalItem.user.id ? (
                isSubscribed ? (
                  <div className="bg-blue-50 p-4 rounded-lg mt-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Request to Rent
                    </h2>
                    <RentalRequestForm
                      rentalItemId={rentalItem.id}
                      availableBeaches={rentalItem.availableBeaches.map(
                        (c) => ({
                          id: c.beach.id,
                          name: c.beach.name,
                        })
                      )}
                      dailyPrice={rentalItem.rentPrice}
                    />
                  </div>
                ) : (
                  <div className="bg-yellow-50 p-4 rounded-lg mt-6">
                    <p>You need an active subscription to request rentals.</p>
                    <Link
                      href="/pricing"
                      className="btn-primary mt-2 inline-block"
                    >
                      View Subscription Plans
                    </Link>
                  </div>
                )
              ) : (
                <div className="bg-blue-50 p-4 rounded-lg mt-6">
                  <p>
                    This is your listing. You can manage it from your dashboard.
                  </p>
                  <Link
                    href="/dashboard/rentals"
                    className="btn-primary mt-2 inline-block"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              )
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <p>Please sign in to request this rental.</p>
                <Link href="/login" className="btn-primary mt-2 inline-block">
                  Sign In
                </Link>
              </div>
            )}

            {/* Contact Owner Button - always show if not the owner */}
            {session?.user?.id !== rentalItem.user.id && (
              <div className="mt-4">
                <ContactOwnerButton
                  ownerEmail={rentalItem.user.email}
                  ownerName={rentalItem.user.name}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading rental item:", error);
    return (
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-red-500">
          Error loading rental item
        </h1>
        <p>There was a problem loading this item. Please try again later.</p>
        <Link href="/rentals" className="mt-4 btn-primary inline-block">
          Back to Rentals
        </Link>
      </div>
    );
  }
}
