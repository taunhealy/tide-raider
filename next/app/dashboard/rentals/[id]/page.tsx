import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { RentalItemForm } from "@/app/components/rentals/RentalItemForm";
import { DeleteRentalItemButton } from "@/app/components/rentals/DeleteRentalItemButton";
import { BeachLocationsList } from "@/app/components/rentals/BeachLocationsList";

export async function generateMetadata({ params }: { params: { id: string } }) {
  const rentalItem = await prisma.rentalItem.findUnique({
    where: { id: params.id },
    select: { name: true },
  });

  if (!rentalItem) {
    return {
      title: "Item Not Found | Dashboard",
    };
  }

  return {
    title: `Edit ${rentalItem.name} | Dashboard`,
    description: "Edit your rental item",
  };
}

export default async function EditRentalItemPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard/rentals/${params.id}`);
  }

  // Fetch the rental item
  const rentalItem = await prisma.rentalItem.findUnique({
    where: { id: params.id },
    include: {
      availableBeaches: {
        include: {
          beach: true,
        },
      },
    },
  });

  if (!rentalItem) {
    return notFound();
  }

  // Check if user owns this item
  if (rentalItem.userId !== session.user.id) {
    redirect("/dashboard/rentals");
  }

  // Fetch beaches for the form
  const beaches = await prisma.beach.findMany({
    orderBy: {
      name: "asc",
    },
  });

  // Fetch rental requests for this item
  const rentalRequests = await prisma.rentalItemRequest.findMany({
    where: {
      rentalItemId: params.id,
    },
    include: {
      renter: {
        select: {
          name: true,
          image: true,
        },
      },
      beach: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="heading-4 font-bold">Edit Rental Item</h1>
        <div className="flex space-x-4">
          <Link
            href={`/rentals/${params.id}`}
            className="px-4 py-2 rounded-md border border-[var(--color-border-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            View Listing
          </Link>
          <Link
            href="/dashboard/rentals"
            className="px-4 py-2 rounded-md border border-[var(--color-border-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)] transition-colors"
          >
            Back to Rentals
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-6 mb-6 border border-[var(--color-border-light)]">
            <RentalItemForm beaches={beaches} initialData={rentalItem} />
          </div>
        </div>

        <div>
          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-6 mb-6 border border-[var(--color-border-light)]">
            <h2 className="heading-5 mb-4">Rental Requests</h2>

            {rentalRequests.length > 0 ? (
              <div className="space-y-4">
                {rentalRequests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/rentals/requests/${request.id}`}
                  >
                    <div className="border border-[var(--color-border-light)] rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {request.renter.image && (
                            <img
                              src={request.renter.image}
                              alt={request.renter.name}
                              className="w-8 h-8 rounded-full mr-2"
                            />
                          )}
                          <span className="text-[var(--color-text-primary)]">
                            {request.renter.name}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            request.status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : request.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : request.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : request.status === "CANCELLED"
                                    ? "bg-gray-100 text-gray-800"
                                    : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <div className="text-small text-[var(--color-text-secondary)]">
                        <p>
                          {new Date(request.startDate).toLocaleDateString()} -{" "}
                          {new Date(request.endDate).toLocaleDateString()}
                        </p>
                        <p>Location: {request.beach.name}</p>
                        <p className="font-medium mt-1">
                          Total: R{request.totalCost.zar}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[var(--color-text-tertiary)] text-small">
                No rental requests yet.
              </p>
            )}

            <div className="mt-4">
              <Link
                href="/rentals/requests?type=owner"
                className="text-[var(--color-tertiary)] hover:underline text-small"
              >
                View all requests
              </Link>
            </div>
          </div>

          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-6 mb-6 border border-[var(--color-border-light)]">
            <h2 className="heading-5 mb-4">Available Locations</h2>
            <BeachLocationsList beaches={rentalItem.availableBeaches} />
          </div>

          <div className="bg-[var(--color-bg-primary)] rounded-lg shadow-sm p-6 border border-[var(--color-border-light)]">
            <h2 className="heading-5 mb-4">Danger Zone</h2>
            <p className="text-[var(--color-text-secondary)] text-small mb-4">
              Deleting this rental item will permanently remove it from our
              system. This action cannot be undone.
            </p>
            <DeleteRentalItemButton id={params.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
