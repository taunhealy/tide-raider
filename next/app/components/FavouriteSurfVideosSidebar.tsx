"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/app/components/ui/Skeleton";
import { Favorite } from "@/types/favorites";
import { useSession } from "next-auth/react";

export default function FavouriteSurfVideosSidebar({
  userId,
}: {
  userId?: string;
}) {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(
    null
  );

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const url = userId
          ? `/api/favorites?userId=${encodeURIComponent(userId)}`
          : "/api/favorites/me";

        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        setFavorites(data);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  const handleDeleteFavorite = async (favoriteId: string) => {
    try {
      const response = await fetch(`/api/favorites/${favoriteId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete");
      setFavorites(favorites.filter((f) => f.id !== favoriteId));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-[540px]">
      <div className="p-6 border-b border-gray-200 ">
        <div className="flex justify-between items-left ">
          <h6 className="heading-6 text-gray-900">
            Favourite Surf Travel Vids
          </h6>
          <Link
            href={`/favorites/create?from=${encodeURIComponent(window.location.pathname)}`}
            className="flex items-center justify-center h-[40px] text-small bg-[var(--color-bg-tertiary)] text-white px-4 py-2 rounded-md hover:opacity-90"
          >
            Post
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {loading ? (
          Array(3)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))
        ) : favorites.length > 0 ? (
          <table className="w-full">
            <tbody>
              {favorites.map((favorite) => (
                <tr
                  key={favorite.id}
                  className="group relative hover:bg-gray-50 cursor-pointer font-primary"
                  onClick={() => setSelectedFavorite(favorite)}
                >
                  <td className="p-4 text-sm text-gray-600">
                    <Link
                      href={`/profile/${favorite.userId}`}
                      className="hover:text-[var(--color-bg-tertiary)] transition-colors"
                    >
                      {favorite.user?.name || "Anonymous"}
                    </Link>
                  </td>
                  <td className="p-4">
                    <span className="text-[var(--color-primary)] font=primary text-sm font-primary">
                      {favorite.title}
                    </span>
                  </td>
                  {session?.user?.id === favorite.userId && (
                    <td className="p-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFavorite(favorite.id);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-start p-6">
            <p className="text-small font-primary text-gray-800 mb-4">
              No Favourites Yet 🌊
            </p>
            <p className="text-small font-primary text-gray-600">
              Share your favourite surf videos with the community
            </p>
          </div>
        )}
      </div>

      {/* Custom Modal */}
      {selectedFavorite && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl shadow-xl">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="heading-6 font-primary text-gray-900">
                {selectedFavorite.title}
              </h3>
              <button
                onClick={() => setSelectedFavorite(null)}
                className="text-gray-400 font-primary hover:text-gray-600 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {selectedFavorite.videoLink && (
                <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${
                      selectedFavorite.videoLink.includes("youtu.be/")
                        ? selectedFavorite.videoLink.split("youtu.be/")[1]
                        : selectedFavorite.videoLink
                            .split("v=")[1]
                            ?.split("&")[0]
                    }`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-primary text-gray-600">
                  Posted by: {selectedFavorite.user?.name || "Anonymous"}
                </p>
                {selectedFavorite.description && (
                  <p className="text-sm font-primary text-gray-800">
                    {selectedFavorite.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
