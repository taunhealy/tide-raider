import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/lib/authOptions";
import { prisma } from "@/app/lib/prisma";
import { AdCard } from "@/app/components/advertising/AdCard";

export const metadata = {
  title: "Manage Ads | Dashboard",
  description: "Manage your advertising campaigns",
};

export default async function ManageAdsPage() {
  const session = await getServerSession(authOptions);

  // Redirect if not logged in
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/dashboard/ads");
  }

  // Fetch user's ads
  const ads = await prisma.ad.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      adRequest: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Fetch pending ad requests
  const pendingRequests = await prisma.adRequest.count({
    where: {
      userId: session.user.id,
      status: "PENDING",
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-6 font-primary">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Your Ads</h1>
        <Link href="/advertising" className="btn-primary">
          Create New Ad
        </Link>
      </div>

      {pendingRequests > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have {pendingRequests} pending ad{" "}
                {pendingRequests === 1 ? "request" : "requests"}.
              </p>
            </div>
          </div>
        </div>
      )}

      {ads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ads.map((ad) => (
            <div key={ad.id} className="relative">
              <Link href={`/dashboard/ads/${ad.id}`}>
                <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition">
                  <AdCard ad={ad} />
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          ad.status === "active"
                            ? "bg-green-100 text-green-800"
                            : ad.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">Edit Ad</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">No ads yet</h2>
          <p className="text-gray-600 mb-6">
            Start promoting your business with targeted ads!
          </p>
          <Link href="/advertising" className="btn-primary">
            Create Your First Ad
          </Link>
        </div>
      )}
    </div>
  );
}
