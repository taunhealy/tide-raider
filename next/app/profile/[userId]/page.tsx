"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import FavouriteSurfVideosSidebar from "@/app/components/FavouriteSurfVideosSidebar";
import UserNotFound from "@/app/components/UserNotFound";
import BioSection from "@/app/components/profile/BioSection";
import { ClientProfileLogs } from "@/app/components/ClientProfileLogs";
import StoriesContainer from "@/app/components/StoriesContainer";

// Server component
export default function ProfilePage() {
  const { userId } = useParams();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<
    "account" | "favourites" | "logs" | "chronicles"
  >("account");
  const [avatarUrl, setAvatarUrl] = useState("");

  const {
    data: userData,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const res = await fetch(`/api/user/${userId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      return res.json();
    },
  });

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  if (error) return <UserNotFound />;

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
          </div>
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
        <Button
          variant={activeTab === "chronicles" ? "default" : "outline"}
          onClick={() => setActiveTab("chronicles")}
        >
          Chronicles
        </Button>
      </div>

      <div className="min-h-[500px] min-w-full overflow-auto">
        {activeTab === "account" && (
          <BioSection
            initialBio={userData?.bio}
            isOwnProfile={isOwnProfile}
            userId={userId}
          />
        )}

        {activeTab === "favourites" && (
          <FavouriteSurfVideosSidebar userId={userId} />
        )}

        {activeTab === "logs" && (
          <ClientProfileLogs beaches={[]} userId={userId} />
        )}

        {activeTab === "chronicles" && (
          <StoriesContainer beaches={[]} userId={userId} />
        )}
      </div>
    </div>
  );
}
