"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import FavouriteSurfVideosSidebar from "@/app/components/FavouriteSurfVideosSidebar";
import UserNotFound from "@/app/components/UserNotFound";
import BioSection from "@/app/components/profile/BioSection";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId;
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<"account" | "favourites" | "logs">(
    "account"
  );
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  if (!userId || typeof userId !== "string") {
    return <UserNotFound />;
  }

  const {
    data: userData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      console.log("Fetching user data for ID:", userId);
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to fetch user");
      }
      return res.json();
    },
    retry: 2,
    enabled: !!userId,
  });

  const { data: userLogs } = useQuery({
    queryKey: ["userLogs", userId],
    queryFn: async () => {
      const response = await fetch(
        `/api/quest-log/user/${encodeURIComponent(userId)}`
      );
      if (!response.ok) throw new Error("Failed to fetch logs");
      return response.json();
    },
    enabled: !!userId,
  });

  const { mutate: updateAvatar } = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: (data) => {
      setAvatarUrl(data.url);
      queryClient.invalidateQueries({ queryKey: ["user", userId] });
    },
    onError: () => {
      alert("Failed to update avatar");
    },
    onSettled: () => setIsUploading(false),
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Basic client-side validation
      if (!file.type.startsWith("image/")) {
        throw new Error("Only image files are allowed");
      }
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("File size must be less than 2MB");
      }

      updateAvatar(file);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Upload failed");
      setIsUploading(false);
    }
  };

  // Add useEffect to update when userData loads
  useEffect(() => {
    if (userData?.image) {
      setAvatarUrl(userData.image);
    }
  }, [userData]); // Add userData as dependency

  // Improved loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
    );
  }

  // Handle errors properly
  if (error) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p className="text-red-500">Error loading profile: {error.message}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // Determine if current user is viewing their own profile
  const isOwnProfile = session?.user?.id?.toString() === userId;

  return (
    <div className="container mx-auto p-6 font-primary">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative group">
          <div className="relative w-20 h-20 rounded-full overflow-hidden">
            <Image
              src={avatarUrl || "/default-avatar.png"}
              alt="Profile"
              width={80}
              height={80}
              className="object-cover"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {isOwnProfile && (
            <>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
              >
                <span className="text-white text-xs text-center p-2">
                  {isUploading ? "Uploading..." : "Change\nPhoto"}
                </span>
              </label>
            </>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-bold">
            {userData?.name || "Anonymous"}
          </h1>
          <p className="text-gray-600">
            Joined {new Date(userData?.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Button
          variant={activeTab === "account" ? "default" : "outline"}
          onClick={() => setActiveTab("account")}
        >
          Account
        </Button>
        <Button
          variant={activeTab === "favourites" ? "default" : "outline"}
          onClick={() => setActiveTab("favourites")}
        >
          Favourites
        </Button>
        <Button
          variant={activeTab === "logs" ? "default" : "outline"}
          onClick={() => setActiveTab("logs")}
        >
          Logs
        </Button>
      </div>

      <div className="min-h-[500px] min-w-full overflow-auto">
        {activeTab === "account" && (
          <div className="max-w-lg space-y-4">
            <BioSection
              initialBio={userData?.bio}
              isOwnProfile={isOwnProfile}
              userId={userId}
            />
          </div>
        )}

        {activeTab === "favourites" && (
          <div className="space-y-4 min-w-full">
            <FavouriteSurfVideosSidebar userId={userId} />
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-4 min-w-full">
            <h2 className="text-xl font-semibold font-primary">
              Your Surf Logs
            </h2>
            {(userLogs || []).length > 0 ? (
              (userLogs || [])?.map(
                (log: { id: string; beachName: string; date: string }) => (
                  <div key={log.id} className="p-4 border rounded-md">
                    <h3 className="font-medium">{log.beachName}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(log.date).toLocaleDateString()}
                    </p>
                  </div>
                )
              )
            ) : (
              <div className="text-start p-6 bg-gray-50 rounded-lg max-w-[540px]">
                <p className="text-gray-600">No surf logs yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
